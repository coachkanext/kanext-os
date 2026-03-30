/**
 * KayPay - Financial tile for KaNeXT OS
 * Three tabs: Wallet / Pay / Invest
 * Roles: Personal / Institutional
 * Top bar: hamburger | dropdown pill | role pill | filter icon
 */

import React, { useState, useRef, useCallback, useMemo } from 'react';
import {
  View, Text, StyleSheet, Pressable, ScrollView,
  TextInput, Animated,
} from 'react-native';
import * as Haptics from 'expo-haptics';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useFocusEffect } from 'expo-router';
import { GlassView } from '@/components/ui/glass-view';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { BottomSheet } from '@/components/ui/bottom-sheet';
import { RolePill } from '@/components/ui/role-pill';
import { useColors, type ComponentColors } from '@/hooks/use-colors';
import { useAppContext } from '@/context/app-context';
import { openSidePanel } from '@/utils/global-side-panel';
import { resetFooter } from '@/utils/global-footer-hide';
import { useDemoRole, MODE_ACCENTS } from '@/utils/demo-role-store';
import {
  BALANCE, APY_RATE, QUICK_RECIPIENTS, CARD_INFO,
  INFRA_FUND, CAPITAL_POINTS, REMITTANCE_RECIPIENTS,
  ACTIVE_SPLIT, ACTIVE_BOOSTS, MONTHLY_SUMMARY, INSTITUTIONAL_WALLET,
  TRANSACTION_FILTERS, getTransactions, formatCurrency, formatCompact,
  type Transaction, type QuickRecipient, type TransactionFilterKey,
} from '@/data/mock-wallet';

const NAVY='#003A63';
const TOP_BAR_H=52;
const PILL_ROW_H=48;
const KAYPAY_TABS=['Wallet','Pay','Invest'] as const;
const INVEST_FLTRS=['All','Fund','Crypto','Rewards'] as const;
type KayPayTab='Wallet'|'Pay'|'Invest';
type KayPayRole='Personal'|'Institutional';
type InvestFilterKey='All'|'Fund'|'Crypto'|'Rewards';
function initialsHue(i:string):string{const h=[215,145,25,330,280,55,180,0];const x=(i.charCodeAt(0)+(i.charCodeAt(1)||0))%h.length;return 'hsl('+h[x]+', 55%, 42%)';}
function txAmtColor(a:number,C:ComponentColors):string{return a>=0?(C.green as string):(C.red as string);}
function txSign(a:number):string{return a>=0?'+':'';}
// ── KayPay role keys per mode ──────────────────────────────────────────────
const KAYPAY_ROLE_KEYS: Record<string, string> = {
  sports:    'sports:kaypay',
  education: 'education',
  community: 'community',
  business:  'business:kaypay',
  personal:  'personal',
};

export default function KayPayScreen(){
  const C=useColors();
  const insets=useSafeAreaInsets();
  const s=useMemo(()=>makeStyles(C),[C]);
  const topBarH=insets.top+TOP_BAR_H;
  const { state } = useAppContext();
  const mode = state.activeContext?.mode ?? state.mode ?? 'business';
  const roleKey = KAYPAY_ROLE_KEYS[mode] ?? 'business:kaypay';
  const [role, cycleRole, roleCycles] = useDemoRole(roleKey);
  const isAdminRole = role === roleCycles[0];
  const accent = MODE_ACCENTS[mode] ?? C.accent;

  const [activeTab,setActiveTab]=useState("Wallet");
  const [dropdownOpen,setDropdownOpen]=useState(false);
  const [pillsVisible,setPillsVisible]=useState(false);
  const [txFilter,setTxFilter]=useState("all");
  const [investFilter,setInvestFilter]=useState("All");
  const pillsAnim=useRef(new Animated.Value(0)).current;
  const [balanceToggle,setBalanceToggle]=useState("available");
  const [sendStep,setSendStep]=useState(0);
  const [sendRecipient,setSendRecipient]=useState(null);
  const [sendAmount,setSendAmount]=useState("");
  const [sendNote,setSendNote]=useState("");
  const [showSendSheet,setShowSendSheet]=useState(false);
  const [showQRSheet,setShowQRSheet]=useState(false);
  const [showCardSheet,setShowCardSheet]=useState(false);
  const [showBoostsSheet,setShowBoostsSheet]=useState(false);
  const [showRedeemSheet,setShowRedeemSheet]=useState(false);
  const [showSuccess,setShowSuccess]=useState(false);
  const [expandedSettlement,setExpandedSettlement]=useState(null);
  useFocusEffect(useCallback(()=>{resetFooter();},[]));

  function togglePills(){
    Haptics.selectionAsync();
    const next=!pillsVisible;
    setPillsVisible(next);
    Animated.timing(pillsAnim,{toValue:next?1:0,duration:200,useNativeDriver:false}).start();
  }
  function changeTab(tab){
    Haptics.selectionAsync();
    setDropdownOpen(false);
    setActiveTab(tab);
    if(tab==="Pay"){setPillsVisible(false);pillsAnim.setValue(0);}
  }
  function handleCycleRole(){
    cycleRole();
    setPillsVisible(false);
    pillsAnim.setValue(0);
  }
  function openSend(recipient?: QuickRecipient){
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    if(recipient)setSendRecipient(recipient);
    setSendStep(recipient?2:1);
    setShowSendSheet(true);
  }
  function confirmSend(){
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    setShowSuccess(true);
    setTimeout(()=>{
      setShowSuccess(false);setShowSendSheet(false);setSendStep(0);
      setSendRecipient(null);setSendAmount("");setSendNote("");
    },1800);
  }
  const contentPaddingTop=topBarH+(pillsVisible?PILL_ROW_H:0)+8;

  function renderQRGrid(){
    const grid=Array.from({length:14},(_,r)=>Array.from({length:14},(_,c)=>{
      const tl=r<4&&c<4;const tr=r<4&&c>9;const bl=r>9&&c<4;
      const seed=(r*17+c*13+7)%3;
      return tl||tr||bl||seed===0;
    }));
    return(
      <View style={{flexDirection:"column",alignSelf:"center",marginVertical:20}}>
        {grid.map((row,ri)=>(
          <View key={ri} style={{flexDirection:"row"}}>
            {row.map((filled,ci)=>(
              <View key={ci} style={{width:14,height:14,margin:1,backgroundColor:filled?C.label:"transparent",borderRadius:2}}/>
            ))}
          </View>
        ))}
      </View>
    );
  }
  function renderProgressRing(pct,color,size=80){
    const stroke=7,inner=size-stroke*2,deg=Math.round(pct*360);
    return(
      <View style={{width:size,height:size,borderRadius:size/2,backgroundColor:C.separator,alignItems:"center",justifyContent:"center"}}>
        <View style={{position:"absolute",width:size,height:size,borderRadius:size/2,borderWidth:stroke,borderColor:"transparent",borderTopColor:color,borderRightColor:deg>90?color:"transparent",borderBottomColor:deg>180?color:"transparent",borderLeftColor:deg>270?color:"transparent",transform:[{rotate:"-90deg"}]}}/>
        <View style={{width:inner,height:inner,borderRadius:inner/2,backgroundColor:C.surface,alignItems:"center",justifyContent:"center"}}>
          <Text style={{fontSize:13,fontWeight:"800",color:C.label}}>{Math.round(pct*100)+"%"}</Text>
        </View>
      </View>
    );
  }
  function renderSparkline(values,color,barH=32){
    const max=Math.max(...values);
    return(
      <View style={{flexDirection:"row",alignItems:"flex-end",gap:3,height:barH}}>
        {values.map((v,i)=>(
          <View key={i} style={{width:6,borderRadius:3,height:Math.max(4,(v/max)*barH),backgroundColor:color,opacity:i===values.length-1?1:0.5}}/>
        ))}
      </View>
    );
  }

  function renderWalletPersonal(){
    const txs=getTransactions(txFilter);
    const displayBal=balanceToggle==="available"?BALANCE:BALANCE+47;
    return(
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{padding:16,paddingBottom:120,paddingTop:contentPaddingTop}}>
        <Pressable onPress={()=>{Haptics.selectionAsync();setBalanceToggle(p=>p==="available"?"total":"available");}}>
          <GlassView tier={1} style={[s.balanceHero,{backgroundColor:NAVY}]}>
            <Text style={{fontSize:13,color:"rgba(255,255,255,0.55)",fontWeight:"600",textAlign:"center",marginBottom:4}}>
              {balanceToggle==="available"?"Available Balance":"Total Balance"}
            </Text>
            <Text style={s.balanceAmt}>{formatCurrency(displayBal)}</Text>
            {balanceToggle==="total"&&(<Text style={{fontSize:13,color:"rgba(255,255,255,0.50)",textAlign:"center",marginTop:2}}>{"(+$47.00 pending)"}</Text>)}
            <View style={s.apyRow}>
              <View style={s.apyDot}/>
              <Text style={{fontSize:13,color:C.green,fontWeight:"600"}}>{"Earning "+APY_RATE.toFixed(2)+"% APY"}</Text>
              <Text style={{fontSize:12,color:"rgba(255,255,255,0.45)",marginLeft:8}}>{"  +$0.26 today"}</Text>
            </View>
          </GlassView>
        </Pressable>
        <View style={[s.row,{gap:8,marginBottom:12}]}>
          {[{icon:"plus.circle",label:"Add Cash",fn:()=>Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)},{icon:"arrow.down.circle",label:"Cash Out",fn:()=>Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)},{icon:"arrow.up.circle",label:"Send",fn:()=>openSend()},{icon:"qrcode",label:"Receive",fn:()=>{Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);setShowQRSheet(true);}}].map(a=>(
            <Pressable key={a.label} style={{flex:1,alignItems:"center",gap:6}} onPress={a.fn}>
              <GlassView tier={2} style={s.quickActCircle}>
                <IconSymbol name={a.icon} size={22} color={C.accent}/>
              </GlassView>
              <Text style={{fontSize:11,fontWeight:"600",color:C.secondary}}>{a.label}</Text>
            </Pressable>
          ))}
        </View>
        <GlassView tier={1} style={s.card}>
          <View style={[s.row,{justifyContent:"space-between",marginBottom:12}]}>
            <Text style={[s.sectionHeader,{marginBottom:0}]}>KaNeXT Card</Text>
            <View style={{backgroundColor:"rgba(90,138,110,0.15)",paddingHorizontal:10,paddingVertical:4,borderRadius:10}}>
              <Text style={{fontSize:12,fontWeight:"700",color:C.green}}>Active</Text>
            </View>
          </View>
          <View style={s.virtualCard}>
            <Text style={s.virtualCardTitle}>KaNeXT</Text>
            <Text style={s.virtualCardNum}>{"\u2022\u2022\u2022\u2022  \u2022\u2022\u2022\u2022  \u2022\u2022\u2022\u2022  "+CARD_INFO.last4}</Text>
            <View style={[s.row,{justifyContent:"space-between"}]}>
              <Text style={{fontSize:11,color:"rgba(255,255,255,0.55)"}}>{CARD_INFO.expiry}</Text>
              <Text style={{fontSize:11,color:"rgba(255,255,255,0.75)",fontWeight:"600"}}>{CARD_INFO.name}</Text>
            </View>
          </View>
          <View style={[s.row,{gap:8,marginTop:14}]}>
            {[{icon:"snowflake",label:"Freeze"},{icon:"eye.slash",label:"Number"},{icon:"applelogo",label:"Apple Pay"},{icon:"creditcard",label:"Order Card"}].map(a=>(
              <Pressable key={a.label} style={{flex:1,alignItems:"center",gap:5}}
                onPress={()=>{Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);if(a.label==="Number")setShowCardSheet(true);}}>
                <GlassView tier={2} style={{width:40,height:40,borderRadius:20,alignItems:"center",justifyContent:"center"}}>
                  <IconSymbol name={a.icon} size={18} color={C.accent}/>
                </GlassView>
                <Text style={{fontSize:10,color:C.secondary,fontWeight:"600"}}>{a.label}</Text>
              </Pressable>
            ))}
          </View>
          <View style={[s.row,{marginTop:14,paddingTop:12,borderTopWidth:StyleSheet.hairlineWidth,borderTopColor:C.separator,flexWrap:"wrap",gap:6}]}>
            <Text style={{fontSize:13,fontWeight:"700",color:C.label,marginRight:2}}>Boosts:</Text>
            {ACTIVE_BOOSTS.filter(b=>b.active).map(b=>(
              <View key={b.id} style={{backgroundColor:"rgba(217,119,87,0.12)",paddingHorizontal:10,paddingVertical:4,borderRadius:10}}>
                <Text style={{fontSize:12,fontWeight:"700",color:C.accent}}>{b.merchant+" \u00B7 "+b.discount}</Text>
              </View>
            ))}
            <Pressable onPress={()=>{Haptics.selectionAsync();setShowBoostsSheet(true);}}>
              <Text style={{fontSize:12,fontWeight:"700",color:C.accent,paddingVertical:4}}>+ Browse</Text>
            </Pressable>
          </View>
        </GlassView>
        <Text style={[s.sectionHeader,{marginBottom:10}]}>Savings Goals</Text>
        <View style={[s.row,{gap:10,marginBottom:12}]}>
          {[{name:"New Car",current:3200,target:5000},{name:"Emergency Fund",current:8400,target:10000}].map(g=>(
            <GlassView key={g.name} tier={1} style={{flex:1,padding:14,borderRadius:16,alignItems:"center",gap:8}}>
              {renderProgressRing(g.current/g.target,C.accent,72)}
              <Text style={{fontSize:13,fontWeight:"700",color:C.label,textAlign:"center"}}>{g.name}</Text>
              <Text style={{fontSize:11,color:C.secondary}}>{formatCompact(g.current)+" / "+formatCompact(g.target)}</Text>
              <View style={{backgroundColor:"rgba(90,138,110,0.15)",paddingHorizontal:8,paddingVertical:3,borderRadius:8}}>
                <Text style={{fontSize:11,fontWeight:"700",color:C.green}}>4% APY</Text>
              </View>
            </GlassView>
          ))}
        </View>
        <GlassView tier={1} style={s.card}>
          <Pressable onPress={()=>Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)}>
            <View style={[s.row,{justifyContent:"space-between",marginBottom:10}]}>
              <Text style={[s.sectionHeader,{marginBottom:0}]}>{MONTHLY_SUMMARY.month}</Text>
              <IconSymbol name="chevron.right" size={14} color={C.muted}/>
            </View>
            <View style={[s.row,{gap:8,marginBottom:14}]}>
              {[{label:"Spent",value:MONTHLY_SUMMARY.spent,color:C.red},{label:"Received",value:MONTHLY_SUMMARY.received,color:C.green},{label:"Saved",value:MONTHLY_SUMMARY.saved,color:C.accent}].map(stat=>(
                <GlassView key={stat.label} tier={2} style={{flex:1,padding:10,borderRadius:12,alignItems:"center"}}>
                  <Text style={{fontSize:14,fontWeight:"800",color:stat.color}}>{formatCompact(stat.value)}</Text>
                  <Text style={{fontSize:11,color:C.secondary,marginTop:2}}>{stat.label}</Text>
                </GlassView>
              ))}
            </View>
            {MONTHLY_SUMMARY.breakdown.map(cat=>{
              const pct=cat.amount/MONTHLY_SUMMARY.spent;
              return(
                <View key={cat.category} style={[s.row,{marginBottom:7,gap:8}]}>
                  <Text style={{width:90,fontSize:12,color:C.secondary}}>{cat.label}</Text>
                  <View style={{flex:1,height:6,backgroundColor:C.separator,borderRadius:3,overflow:"hidden"}}>
                    <View style={{width:(Math.round(pct*100))+"%" as any,height:6,backgroundColor:cat.color,borderRadius:3}}/>
                  </View>
                  <Text style={{width:44,fontSize:12,fontWeight:"600",color:C.label,textAlign:"right"}}>{formatCompact(cat.amount)}</Text>
                </View>
              );
            })}
          </Pressable>
        </GlassView>
        <View style={[s.row,{justifyContent:"space-between",marginBottom:4,marginTop:4}]}>
          <Text style={[s.sectionHeader,{marginBottom:0}]}>Recent Transactions</Text>
          <Pressable onPress={togglePills}>
            <IconSymbol name="line.3.horizontal.decrease.circle" size={22} color={pillsVisible?C.accent:C.muted}/>
          </Pressable>
        </View>
        <Animated.View style={{height:pillsAnim.interpolate({inputRange:[0,1],outputRange:[0,PILL_ROW_H]}),opacity:pillsAnim,overflow:"hidden"}}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{paddingVertical:8,gap:8}}>
            {TRANSACTION_FILTERS.map(f=>(
              <Pressable key={f.key} onPress={()=>{Haptics.selectionAsync();setTxFilter(f.key);}}>
                <GlassView tier={txFilter===f.key?1:2} style={{paddingHorizontal:14,paddingVertical:7,borderRadius:16}}>
                  <Text style={{fontSize:13,fontWeight:"700",color:txFilter===f.key?C.label:C.secondary}}>{f.label}</Text>
                </GlassView>
              </Pressable>
            ))}
          </ScrollView>
        </Animated.View>
        {txs.map(tx=>(
          <Pressable key={tx.id} onPress={()=>Haptics.selectionAsync()}>
            <View style={s.txRow}>
              <View style={[s.txAvatar,{backgroundColor:initialsHue(tx.avatarInitials),alignItems:"center",justifyContent:"center"}]}>
                <Text style={{color:"#fff",fontWeight:"800",fontSize:14}}>{tx.avatarInitials}</Text>
              </View>
              <View style={{flex:1}}>
                <Text style={[s.bodyMed,{color:C.label}]}>{tx.name}</Text>
                <Text style={[s.bodySmall,{color:C.secondary}]}>{tx.note}</Text>
              </View>
              <View style={{alignItems:"flex-end"}}>
                <Text style={[s.txAmt,{color:txAmtColor(tx.amount,C)}]}>{txSign(tx.amount)+formatCurrency(tx.amount)}</Text>
                <Text style={{fontSize:11,color:C.muted}}>{tx.timestamp}</Text>
              </View>
            </View>
          </Pressable>
        ))}
      </ScrollView>
    );
  }

  function renderWalletInstitutional(){
    return(
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{padding:16,paddingBottom:120,paddingTop:contentPaddingTop}}>
        <GlassView tier={1} style={[s.balanceHero,{backgroundColor:NAVY}]}>
          <Text style={{fontSize:12,color:"rgba(255,255,255,0.55)",fontWeight:"600",textAlign:"center",letterSpacing:0.5}}>{INSTITUTIONAL_WALLET.orgName.toUpperCase()}</Text>
          <Text style={s.balanceAmt}>{formatCompact(INSTITUTIONAL_WALLET.balance)}</Text>
          <Text style={{fontSize:13,color:"rgba(255,255,255,0.50)",textAlign:"center",marginTop:2}}>Operating Funds</Text>
        </GlassView>
        <Text style={[s.sectionHeader,{marginBottom:10}]}>Fund Accounts</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{gap:10,paddingBottom:12}}>
          {INSTITUTIONAL_WALLET.funds.map(fa=>(
            <GlassView key={fa.id} tier={1} style={{width:140,padding:14,borderRadius:16,gap:6}}>
              <Text style={{fontSize:12,fontWeight:"700",color:C.secondary}}>{fa.name}</Text>
              <Text style={{fontSize:20,fontWeight:"800",color:C.label}}>{formatCompact(fa.balance)}</Text>
              <View style={{gap:3}}>
                <View style={[s.row,{gap:4}]}>
                  <IconSymbol name="arrow.up.circle.fill" size={12} color={C.green}/>
                  <Text style={{fontSize:11,color:C.green,fontWeight:"600"}}>{formatCompact(fa.inflow)}</Text>
                </View>
                <View style={[s.row,{gap:4}]}>
                  <IconSymbol name="arrow.down.circle.fill" size={12} color={C.red}/>
                  <Text style={{fontSize:11,color:C.red,fontWeight:"600"}}>{formatCompact(fa.outflow)}</Text>
                </View>
              </View>
            </GlassView>
          ))}
        </ScrollView>
        <View style={[s.row,{gap:10,marginBottom:12}]}>
          <GlassView tier={1} style={{flex:1,padding:14,borderRadius:16}}>
            <Text style={{fontSize:11,fontWeight:"600",color:C.secondary}}>Commerce</Text>
            <Text style={{fontSize:22,fontWeight:"800",color:C.label,marginTop:4}}>{formatCompact(INSTITUTIONAL_WALLET.commerceMonth)}</Text>
            <Text style={{fontSize:11,color:C.muted}}>processed this month</Text>
            <View style={[s.row,{gap:6,marginTop:8}]}>
              <View style={s.infoBadge}><Text style={{fontSize:11,fontWeight:"700",color:C.accent}}>5% card</Text></View>
              <View style={s.infoBadge}><Text style={{fontSize:11,fontWeight:"700",color:C.accent}}>3% wallet</Text></View>
            </View>
          </GlassView>
          <GlassView tier={1} style={{flex:1,padding:14,borderRadius:16}}>
            <Text style={{fontSize:11,fontWeight:"600",color:C.secondary}}>Payroll</Text>
            <Text style={{fontSize:22,fontWeight:"800",color:C.label,marginTop:4}}>{formatCompact(INSTITUTIONAL_WALLET.payrollNext.amount)}</Text>
            <Text style={{fontSize:11,color:C.muted}}>{"Next: "+INSTITUTIONAL_WALLET.payrollNext.date}</Text>
            <View style={{marginTop:8}}><View style={{backgroundColor:"rgba(90,138,110,0.15)",paddingHorizontal:8,paddingVertical:4,borderRadius:8,alignSelf:"flex-start"}}><Text style={{fontSize:11,fontWeight:"700",color:C.green}}>Scheduled</Text></View></View>
          </GlassView>
        </View>
        <Text style={[s.sectionHeader,{marginBottom:10}]}>Governed Settlements</Text>
        {INSTITUTIONAL_WALLET.settlements.map(st=>{
          const expanded=expandedSettlement===st.id;
          const sColor=C.green;
          return(
            <GlassView key={st.id} tier={1} style={s.card}>
              <Pressable onPress={()=>{Haptics.selectionAsync();setExpandedSettlement(expanded?null:st.id);}}>
                <View style={[s.row,{justifyContent:"space-between"}]}>
                  <View style={{flex:1}}>
                    <Text style={[s.bodyMed,{color:C.label}]}>{st.description}</Text>
                    <Text style={[s.bodySmall,{color:C.secondary,marginTop:2}]}>{st.timestamp}</Text>
                  </View>
                  <View style={{alignItems:"flex-end",gap:4,marginLeft:12}}>
                    <Text style={{fontSize:16,fontWeight:"800",color:C.label}}>{formatCurrency(st.amount)}</Text>
                    <View style={{backgroundColor:sColor+"22",paddingHorizontal:8,paddingVertical:3,borderRadius:8}}>
                      <Text style={{fontSize:11,fontWeight:"700",color:sColor}}>Settled</Text>
                    </View>
                  </View>
                </View>
              </Pressable>
              {expanded&&(
                <View style={{marginTop:14}}>
                  {Object.entries(st.chain).map(([step,detail],i)=>(
                    <View key={step} style={[s.ladderRow,{borderBottomColor:C.separator}]}>
                      <View style={{width:28,height:28,borderRadius:14,backgroundColor:C.accent+"22",alignItems:"center",justifyContent:"center"}}>
                        <Text style={{fontSize:11,fontWeight:"800",color:C.accent}}>{String(i+1)}</Text>
                      </View>
                      <View style={{flex:1}}>
                        <Text style={{fontSize:10,fontWeight:"700",color:C.secondary,textTransform:"uppercase",letterSpacing:0.5}}>{step}</Text>
                        <Text style={{fontSize:13,fontWeight:"600",color:C.label}}>{detail as string}</Text>
                      </View>
                    </View>
                  ))}
                  <Text style={{fontSize:12,fontWeight:"700",color:C.secondary,marginTop:12,marginBottom:6}}>Auto-Split</Text>
                  {st.split.map(sp=>(
                    <View key={sp.label} style={[s.row,{justifyContent:"space-between",paddingVertical:5}]}>
                      <Text style={{fontSize:13,color:C.label}}>{sp.label}</Text>
                      <View style={[s.row,{gap:8}]}>
                        <Text style={{fontSize:12,color:C.muted}}>{sp.pct+"%"}</Text>
                        <Text style={{fontSize:13,fontWeight:"700",color:C.green}}>{formatCurrency(sp.amount)}</Text>
                      </View>
                    </View>
                  ))}
                </View>
              )}
            </GlassView>
          );
        })}
      </ScrollView>
    );
  }

  function renderWalletTab(){return isAdminRole?renderWalletInstitutional():renderWalletPersonal();}

  function renderPayTab(){
    return(
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{padding:16,paddingBottom:120,paddingTop:contentPaddingTop}}>
        <View style={[s.row,{gap:10,marginBottom:20}]}>
          <Pressable style={{flex:1}} onPress={()=>openSend()}>
            <View style={[s.giveBtn,{backgroundColor:C.accent,marginTop:0}]}>
              <Text style={s.giveBtnText}>Send Money</Text>
            </View>
          </Pressable>
          <Pressable style={{flex:1}} onPress={()=>Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)}>
            <View style={[s.outlineBtn,{borderColor:NAVY,height:52,borderRadius:26}]}>
              <Text style={[s.outlineBtnText,{color:NAVY,fontSize:16,fontWeight:"800"}]}>Request</Text>
            </View>
          </Pressable>
        </View>
        <Text style={[s.sectionHeader,{marginBottom:10}]}>Recent</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{gap:16,paddingBottom:16}}>
          {QUICK_RECIPIENTS.map(r=>(
            <Pressable key={r.id} style={{alignItems:"center",gap:6}} onPress={()=>openSend(r)}>
              <View style={{width:52,height:52,borderRadius:26,backgroundColor:initialsHue(r.initials),alignItems:"center",justifyContent:"center"}}>
                <Text style={{color:"#fff",fontWeight:"800",fontSize:18}}>{r.initials}</Text>
              </View>
              <Text style={{fontSize:12,fontWeight:"600",color:C.secondary}}>{r.name}</Text>
            </Pressable>
          ))}
        </ScrollView>
        <GlassView tier={1} style={s.card}>
          <Text style={[s.sectionHeader,{marginBottom:10}]}>QR Code</Text>
          <View style={[s.row,{gap:10}]}>
            <Pressable style={{flex:1}} onPress={()=>{Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);setShowQRSheet(true);}}>
              <GlassView tier={2} style={[s.outlineBtn,{borderColor:C.inputBorder}]}>
                <Text style={[s.outlineBtnText,{color:C.label}]}>My QR Code</Text>
              </GlassView>
            </Pressable>
            <Pressable style={{flex:1}} onPress={()=>Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)}>
              <View style={[s.outlineBtn,{borderColor:C.accent}]}>
                <Text style={[s.outlineBtnText,{color:C.accent}]}>Scan QR</Text>
              </View>
            </Pressable>
          </View>
        </GlassView>
        <GlassView tier={1} style={s.card}>
          <View style={[s.row,{justifyContent:"space-between",marginBottom:8}]}>
            <Text style={[s.sectionHeader,{marginBottom:0}]}>International</Text>
            <View style={{backgroundColor:"rgba(90,138,110,0.15)",paddingHorizontal:8,paddingVertical:4,borderRadius:10}}>
              <Text style={{fontSize:12,fontWeight:"700",color:C.green}}>0.2% fee</Text>
            </View>
          </View>
          <GlassView tier={2} style={{padding:12,borderRadius:12,marginBottom:12}}>
            <View style={[s.row,{gap:8}]}>
              <IconSymbol name="dollarsign.circle.fill" size={22} color={C.green}/>
              <View style={{flex:1}}>
                <Text style={{fontSize:13,fontWeight:"700",color:C.label}}>0.2% vs 5–10% at Western Union</Text>
                <Text style={{fontSize:12,color:C.secondary}}>$847 saved this year</Text>
              </View>
            </View>
          </GlassView>
          {REMITTANCE_RECIPIENTS.map(rr=>(
            <Pressable key={rr.id} onPress={()=>Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium)}>
              <View style={[s.txRow]}>
                <View style={[s.txAvatar,{backgroundColor:initialsHue(rr.name.slice(0,2)),alignItems:"center",justifyContent:"center"}]}>
                  <Text style={{fontSize:20}}>{rr.flag}</Text>
                </View>
                <View style={{flex:1}}>
                  <Text style={[s.bodyMed,{color:C.label}]}>{rr.name}</Text>
                  <Text style={[s.bodySmall,{color:C.secondary}]}>{rr.country}</Text>
                </View>
                <View style={{alignItems:"flex-end"}}>
                  <Text style={{fontSize:13,fontWeight:"700",color:C.label}}>{formatCurrency(rr.lastAmount)}</Text>
                  <Text style={{fontSize:11,color:C.muted}}>{rr.lastDate}</Text>
                </View>
              </View>
            </Pressable>
          ))}
          <Pressable style={{marginTop:10}} onPress={()=>Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)}>
            <View style={[s.outlineBtn,{borderColor:NAVY}]}><Text style={[s.outlineBtnText,{color:NAVY}]}>Send International</Text></View>
          </Pressable>
        </GlassView>
        <GlassView tier={1} style={s.card}>
          <Text style={[s.sectionHeader,{marginBottom:10}]}>Split Payment</Text>
          <View style={[s.row,{justifyContent:"space-between",marginBottom:12}]}>
            <Text style={[s.bodyMed,{color:C.label,flex:1}]}>{ACTIVE_SPLIT.description}</Text>
            <Text style={{fontSize:16,fontWeight:"800",color:C.label}}>{formatCurrency(ACTIVE_SPLIT.total)}</Text>
          </View>
          {ACTIVE_SPLIT.participants.map(p=>(
            <View key={p.id} style={[s.row,{paddingVertical:8,borderBottomWidth:StyleSheet.hairlineWidth,borderBottomColor:C.separator}]}>
              <View style={{width:34,height:34,borderRadius:17,backgroundColor:initialsHue(p.initials),alignItems:"center",justifyContent:"center",marginRight:10}}>
                <Text style={{color:"#fff",fontWeight:"800",fontSize:12}}>{p.initials}</Text>
              </View>
              <Text style={{flex:1,fontSize:14,fontWeight:"600",color:C.label}}>{p.name}</Text>
              <Text style={{fontSize:14,fontWeight:"700",color:C.label,marginRight:10}}>{formatCurrency(p.amount)}</Text>
              {p.paid?(
                <View style={{backgroundColor:"rgba(90,138,110,0.15)",paddingHorizontal:8,paddingVertical:3,borderRadius:8}}>
                  <Text style={{fontSize:11,fontWeight:"700",color:C.green}}>Paid</Text>
                </View>
              ):(
                <Pressable onPress={()=>Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)}>
                  <View style={{backgroundColor:"rgba(217,119,87,0.12)",paddingHorizontal:8,paddingVertical:3,borderRadius:8}}>
                    <Text style={{fontSize:11,fontWeight:"700",color:C.accent}}>Remind</Text>
                  </View>
                </Pressable>
              )}
            </View>
          ))}
        </GlassView>
      </ScrollView>
    );
  }

  function renderInvestTab(){
    const btcValue=0.015*87342;
    const totalInv=INFRA_FUND.invested+btcValue;
    const portBars=[1820,2100,1950,2400,2700,Math.round(totalInv)];
    return(
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{padding:16,paddingBottom:120,paddingTop:contentPaddingTop}}>
        <GlassView tier={1} style={[s.balanceHero,{backgroundColor:NAVY,marginBottom:12}]}>
          <Text style={{fontSize:12,color:"rgba(255,255,255,0.55)",fontWeight:"600",textAlign:"center"}}>Total Invested</Text>
          <Text style={s.balanceAmt}>{formatCurrency(totalInv)}</Text>
          <View style={[s.row,{justifyContent:"center",gap:6,marginTop:6}]}>
            <Text style={{fontSize:14,fontWeight:"700",color:C.green}}>+$246 (+12.3%)</Text>
          </View>
          <View style={[s.row,{justifyContent:"center",gap:8,marginTop:10}]}>
            {["Fund","BTC","Points"].map(p=>(
              <View key={p} style={{backgroundColor:"rgba(255,255,255,0.12)",paddingHorizontal:12,paddingVertical:5,borderRadius:12}}>
                <Text style={{fontSize:12,fontWeight:"700",color:"rgba(255,255,255,0.85)"}}>{p}</Text>
              </View>
            ))}
          </View>
          <View style={[s.row,{justifyContent:"center",marginTop:14}]}>{renderSparkline(portBars,C.green,36)}</View>
        </GlassView>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{gap:8,paddingBottom:12}}>
          {INVEST_FLTRS.map(f=>(
            <Pressable key={f} onPress={()=>{Haptics.selectionAsync();setInvestFilter(f);}}>
              <GlassView tier={investFilter===f?1:2} style={{paddingHorizontal:14,paddingVertical:7,borderRadius:16}}>
                <Text style={{fontSize:13,fontWeight:"700",color:investFilter===f?C.label:C.secondary}}>{f}</Text>
              </GlassView>
            </Pressable>
          ))}
        </ScrollView>
        {(investFilter==="All"||investFilter==="Fund")&&(
          <GlassView tier={1} style={s.card}>
            <View style={[s.row,{justifyContent:"space-between",marginBottom:10}]}>
              <Text style={[s.bodyMed,{color:C.label,flex:1}]}>KaNeXT Infrastructure Fund</Text>
              <View style={{backgroundColor:"rgba(0,58,99,0.12)",paddingHorizontal:8,paddingVertical:3,borderRadius:8}}>
                <Text style={{fontSize:11,fontWeight:"700",color:NAVY}}>{INFRA_FUND.targetMin+"\u2013"+INFRA_FUND.targetMax+"% target"}</Text>
              </View>
            </View>
            <View style={[s.row,{gap:12,marginBottom:12}]}>
              {[{l:"invested",v:formatCurrency(INFRA_FUND.invested),c:C.label},{l:"earned",v:"+"+formatCurrency(INFRA_FUND.returnAmount),c:C.green},{l:"return",v:INFRA_FUND.returnPct+"%",c:C.green}].map((stat,i)=>(
                <React.Fragment key={stat.l}>
                  {i>0&&<View style={{width:1,height:32,backgroundColor:C.separator}}/>}
                  <View style={{alignItems:"center",flex:1}}>
                    <Text style={{fontSize:16,fontWeight:"800",color:stat.c}}>{stat.v}</Text>
                    <Text style={{fontSize:11,color:C.secondary}}>{stat.l}</Text>
                  </View>
                </React.Fragment>
              ))}
            </View>
            <Text style={{fontSize:12,color:C.muted,marginBottom:10}}>{"$"+INFRA_FUND.fundSizeM+"M fund \u00B7 "+INFRA_FUND.investors.toLocaleString()+" investors"}</Text>
            {INFRA_FUND.projects.map(p=>(
              <View key={p.id} style={[s.row,{paddingVertical:8,borderBottomWidth:StyleSheet.hairlineWidth,borderBottomColor:C.separator,gap:8}]}>
                <View style={{flex:1}}>
                  <Text style={{fontSize:13,fontWeight:"600",color:C.label}}>{p.name}</Text>
                  <View style={[s.row,{gap:6,marginTop:3}]}>
                    <View style={{backgroundColor:"rgba(0,58,99,0.10)",paddingHorizontal:7,paddingVertical:2,borderRadius:6}}>
                      <Text style={{fontSize:10,fontWeight:"700",color:NAVY}}>{p.type}</Text>
                    </View>
                    <View style={{backgroundColor:p.status==="active"?"rgba(90,138,110,0.15)":"rgba(139,99,67,0.10)",paddingHorizontal:7,paddingVertical:2,borderRadius:6}}>
                      <Text style={{fontSize:10,fontWeight:"700",color:p.status==="active"?C.green:C.secondary}}>{p.status}</Text>
                    </View>
                  </View>
                </View>
                {p.quarterlyRevenue!=null&&<Text style={{fontSize:13,fontWeight:"700",color:C.label}}>{formatCompact(p.quarterlyRevenue)+"/qtr"}</Text>}
              </View>
            ))}
            <Text style={{fontSize:12,fontWeight:"700",color:C.secondary,marginTop:12,marginBottom:6}}>Distributions</Text>
            {INFRA_FUND.distributions.map((d,i)=>(
              <View key={i} style={[s.row,{justifyContent:"space-between",paddingVertical:5}]}>
                <Text style={{fontSize:12,color:C.secondary}}>{d.date}</Text>
                <Text style={{fontSize:13,fontWeight:"700",color:C.green}}>{"+ "+formatCurrency(d.amount)}</Text>
              </View>
            ))}
            <Pressable style={{marginTop:14}} onPress={()=>Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium)}>
              <View style={[s.giveBtn,{backgroundColor:C.accent}]}><Text style={s.giveBtnText}>Invest More</Text></View>
            </Pressable>
          </GlassView>
        )}
        {(investFilter==="All"||investFilter==="Crypto")&&(
          <GlassView tier={1} style={s.card}>
            <View style={[s.row,{justifyContent:"space-between",marginBottom:10}]}>
              <Text style={[s.sectionHeader,{marginBottom:0}]}>Bitcoin</Text>
              <View style={[s.row,{gap:8}]}>
                <Text style={{fontSize:18,fontWeight:"800",color:C.label}}>$87,342</Text>
                {renderSparkline([62000,74000,68000,79000,83000,87342],C.green,24)}
              </View>
            </View>
            <GlassView tier={2} style={{padding:12,borderRadius:12,marginBottom:12}}>
              <Text style={{fontSize:13,fontWeight:"600",color:C.secondary}}>Your holdings</Text>
              <Text style={{fontSize:20,fontWeight:"800",color:C.label,marginTop:2}}>{formatCurrency(btcValue)}</Text>
              <Text style={{fontSize:12,color:C.secondary}}>0.015 BTC</Text>
              <Text style={{fontSize:13,fontWeight:"700",color:C.green,marginTop:4}}>+$390 since purchase</Text>
            </GlassView>
            <View style={[s.row,{gap:10}]}>
              <Pressable style={{flex:1}} onPress={()=>Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium)}>
                <View style={[s.giveBtn,{backgroundColor:C.accent,marginTop:0}]}><Text style={s.giveBtnText}>Buy</Text></View>
              </Pressable>
              <Pressable style={{flex:1}} onPress={()=>Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium)}>
                <View style={[s.outlineBtn,{borderColor:C.accent,height:52,borderRadius:26}]}>
                  <Text style={[s.outlineBtnText,{color:C.accent,fontSize:16,fontWeight:"800"}]}>Sell</Text>
                </View>
              </Pressable>
            </View>
          </GlassView>
        )}
        {(investFilter==="All"||investFilter==="Rewards")&&(
          <GlassView tier={1} style={s.card}>
            <View style={[s.row,{justifyContent:"space-between",marginBottom:12}]}>
              <View>
                <Text style={[s.sectionHeader,{marginBottom:0}]}>{CAPITAL_POINTS.total.toLocaleString()+" pts"}</Text>
                <Text style={{fontSize:13,color:C.secondary}}>{"$"+CAPITAL_POINTS.valueUsd+" value"}</Text>
              </View>
              <View style={{backgroundColor:"rgba(0,58,99,0.12)",paddingHorizontal:10,paddingVertical:5,borderRadius:10}}>
                <Text style={{fontSize:12,fontWeight:"700",color:NAVY}}>{"Tier "+CAPITAL_POINTS.tier+" \u00B7 "+CAPITAL_POINTS.tierLabel}</Text>
              </View>
            </View>
            {[
              {level:1,name:"Cashback",       multiplier:"1–2%", unlocked:true,  active:false},
              {level:2,name:"Balance Points", multiplier:"1x",   unlocked:true,  active:false},
              {level:3,name:"Invest Points",  multiplier:"3x",   unlocked:true,  active:true },
              {level:4,name:"Infra Fund",     multiplier:"3x+",  unlocked:false, active:false},
            ].map(lvl=>(
              <View key={lvl.level} style={[s.ladderRow,{borderBottomColor:C.separator,backgroundColor:lvl.active?"rgba(217,119,87,0.06)":"transparent",borderRadius:8,paddingHorizontal:6}]}>
                <View style={{width:36,height:36,borderRadius:18,backgroundColor:lvl.unlocked?(lvl.active?C.accent+"22":"rgba(90,138,110,0.15)"):C.separator,alignItems:"center",justifyContent:"center"}}>
                  <IconSymbol name={lvl.unlocked?(lvl.active?"star.fill":"checkmark.circle.fill"):"lock.fill"} size={16} color={lvl.unlocked?(lvl.active?C.accent:C.green):C.muted}/>
                </View>
                <View style={{flex:1}}>
                  <Text style={{fontSize:14,fontWeight:lvl.active?"800":"600",color:lvl.unlocked?C.label:C.muted}}>{"Level "+lvl.level+": "+lvl.name}</Text>
                </View>
                <View style={{backgroundColor:lvl.unlocked?"rgba(217,119,87,0.12)":C.separator,paddingHorizontal:8,paddingVertical:3,borderRadius:8}}>
                  <Text style={{fontSize:12,fontWeight:"800",color:lvl.unlocked?C.accent:C.muted}}>{lvl.multiplier}</Text>
                </View>
              </View>
            ))}
            <Text style={{fontSize:12,fontWeight:"700",color:C.secondary,marginTop:14,marginBottom:6}}>Breakdown</Text>
            {CAPITAL_POINTS.breakdown.map(row=>(
              <View key={row.source} style={[s.row,{justifyContent:"space-between",paddingVertical:6}]}>
                <Text style={{fontSize:13,color:C.label}}>{row.source}</Text>
                <View style={[s.row,{gap:8}]}>
                  <Text style={{fontSize:12,color:C.muted}}>{row.multiplier}</Text>
                  <Text style={{fontSize:13,fontWeight:"700",color:C.accent}}>{row.points.toLocaleString()+" pts"}</Text>
                </View>
              </View>
            ))}
            <Pressable style={{marginTop:12}} onPress={()=>{Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);setShowRedeemSheet(true);}}>
              <View style={[s.giveBtn,{backgroundColor:C.accent}]}><Text style={s.giveBtnText}>Redeem Points</Text></View>
            </Pressable>
          </GlassView>
        )}
        {(investFilter==="All"||investFilter==="Fund")&&(
          <GlassView tier={1} style={[s.card,{backgroundColor:NAVY}]}>
            <View style={[s.row,{justifyContent:"space-between",marginBottom:6}]}>
              <Text style={{fontSize:17,fontWeight:"800",color:"#fff"}}>KaNeXT Capital Fund</Text>
              <View style={{backgroundColor:"rgba(255,255,255,0.15)",paddingHorizontal:8,paddingVertical:4,borderRadius:8}}>
                <Text style={{fontSize:10,fontWeight:"700",color:"rgba(255,255,255,0.8)"}}>Reg D 506(c)</Text>
              </View>
            </View>
            <Text style={{fontSize:13,color:"rgba(255,255,255,0.60)",marginBottom:10}}>$500M LP/GP · 1.5x Return · Accredited Only</Text>
            <Text style={{fontSize:14,fontStyle:"italic",color:"rgba(255,255,255,0.75)",lineHeight:20,marginBottom:14}}>"Zero equity. Zero governance. The product IS the pitch deck."</Text>
            <Pressable onPress={()=>Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)}>
              <View style={{height:44,borderRadius:22,borderWidth:1.5,borderColor:"rgba(255,255,255,0.5)",alignItems:"center",justifyContent:"center"}}>
                <Text style={{fontSize:14,fontWeight:"700",color:"#fff"}}>Request Invite</Text>
              </View>
            </Pressable>
          </GlassView>
        )}
      </ScrollView>
    );
  }

  function renderSendSheet(){
    return(
      <BottomSheet visible={showSendSheet} onClose={()=>{setShowSendSheet(false);setSendStep(0);setSendRecipient(null);setSendAmount("");setSendNote("");}} useModal snapPoints={["50%","100%"]}>
        <View style={{padding:20,flex:1}}>
          {showSuccess?(
            <View style={{flex:1,alignItems:"center",justifyContent:"center",gap:12}}>
              <View style={{width:72,height:72,borderRadius:36,backgroundColor:"rgba(90,138,110,0.15)",alignItems:"center",justifyContent:"center"}}>
                <IconSymbol name="checkmark.circle.fill" size={44} color={C.green}/>
              </View>
              <Text style={{fontSize:22,fontWeight:"800",color:C.label}}>Sent!</Text>
              <Text style={{fontSize:14,color:C.secondary}}>{formatCurrency(parseFloat(sendAmount)||0)+" sent to "+(sendRecipient?.name??"recipient")}</Text>
            </View>
          ):sendStep===1?(
            <View style={{gap:16}}>
              <Text style={{fontSize:20,fontWeight:"800",color:C.label}}>Who?</Text>
              <GlassView tier={2} style={{flexDirection:"row",alignItems:"center",paddingHorizontal:14,height:46,borderRadius:14}}>
                <IconSymbol name="magnifyingglass" size={16} color={C.muted}/>
                <TextInput placeholder="Search name or @handle" placeholderTextColor={C.muted} style={{flex:1,marginLeft:10,fontSize:15,color:C.label}}/>
              </GlassView>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{gap:14}}>
                {QUICK_RECIPIENTS.map(r=>(
                  <Pressable key={r.id} style={{alignItems:"center",gap:6}} onPress={()=>{Haptics.selectionAsync();setSendRecipient(r);setSendStep(2);}}>
                    <View style={{width:52,height:52,borderRadius:26,backgroundColor:initialsHue(r.initials),alignItems:"center",justifyContent:"center"}}>
                      <Text style={{color:"#fff",fontWeight:"800",fontSize:18}}>{r.initials}</Text>
                    </View>
                    <Text style={{fontSize:12,fontWeight:"600",color:C.secondary}}>{r.name}</Text>
                  </Pressable>
                ))}
              </ScrollView>
              <Pressable onPress={()=>Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)}>
                <View style={[s.outlineBtn,{borderColor:C.accent}]}><Text style={[s.outlineBtnText,{color:C.accent}]}>Scan QR</Text></View>
              </Pressable>
            </View>
          ):sendStep===2?(
            <View style={{gap:16}}>
              <View style={[s.row,{gap:10}]}>
                <Pressable onPress={()=>setSendStep(1)}><IconSymbol name="chevron.left" size={20} color={C.accent}/></Pressable>
                <View style={{flex:1,alignItems:"center"}}>
                  <View style={{width:44,height:44,borderRadius:22,backgroundColor:initialsHue(sendRecipient?.initials??"AA"),alignItems:"center",justifyContent:"center"}}>
                    <Text style={{color:"#fff",fontWeight:"800",fontSize:16}}>{sendRecipient?.initials??"?"}</Text>
                  </View>
                  <Text style={{fontSize:14,fontWeight:"700",color:C.label,marginTop:4}}>{sendRecipient?.name??""}</Text>
                </View>
              </View>
              <TextInput value={sendAmount} onChangeText={setSendAmount} keyboardType="decimal-pad" placeholder="$0" placeholderTextColor={C.muted} style={{fontSize:56,fontWeight:"800",color:C.label,textAlign:"center"}}/>
              <Pressable onPress={()=>{}} style={{alignSelf:"center"}}>
                <GlassView tier={2} style={{paddingHorizontal:14,paddingVertical:10,borderRadius:14}}>
                  <Text style={{fontSize:13,fontWeight:"600",color:C.secondary}}>{"KayPay Balance · "+formatCurrency(BALANCE)}</Text>
                </GlassView>
              </Pressable>
              <Pressable onPress={()=>setSendStep(3)}>
                <View style={[s.giveBtn,{backgroundColor:C.accent}]}><Text style={s.giveBtnText}>Next</Text></View>
              </Pressable>
            </View>
          ):(
            <View style={{gap:14}}>
              <View style={[s.row,{gap:10}]}>
                <Pressable onPress={()=>setSendStep(2)}><IconSymbol name="chevron.left" size={20} color={C.accent}/></Pressable>
                <Text style={{fontSize:20,fontWeight:"800",color:C.label}}>Confirm</Text>
              </View>
              <GlassView tier={2} style={{padding:16,borderRadius:14,gap:8}}>
                <View style={[s.row,{justifyContent:"space-between"}]}>
                  <Text style={{fontSize:14,color:C.secondary}}>To</Text>
                  <Text style={{fontSize:14,fontWeight:"700",color:C.label}}>{sendRecipient?.name??""}</Text>
                </View>
                <View style={[s.row,{justifyContent:"space-between"}]}>
                  <Text style={{fontSize:14,color:C.secondary}}>Amount</Text>
                  <Text style={{fontSize:14,fontWeight:"800",color:C.label}}>{sendAmount?"$"+sendAmount:"$0"}</Text>
                </View>
              </GlassView>
              <GlassView tier={2} style={{flexDirection:"row",alignItems:"center",paddingHorizontal:14,height:46,borderRadius:14}}>
                <TextInput value={sendNote} onChangeText={setSendNote} placeholder="Add a note..." placeholderTextColor={C.muted} style={{flex:1,fontSize:15,color:C.label}}/>
              </GlassView>
              <Pressable onPress={confirmSend}>
                <View style={[s.giveBtn,{backgroundColor:C.accent}]}><Text style={s.giveBtnText}>{"Send "+(sendAmount?"$"+sendAmount:"")+" via KayPay"}</Text></View>
              </Pressable>
              <Text style={{fontSize:12,color:C.muted,textAlign:"center"}}>Face ID / Touch ID may be required</Text>
            </View>
          )}
        </View>
      </BottomSheet>
    );
  }

  function renderQRSheet(){
    return(
      <BottomSheet visible={showQRSheet} onClose={()=>setShowQRSheet(false)} useModal snapPoints={["50%","100%"]}>
        <View style={{padding:20,alignItems:"center"}}>
          <Text style={{fontSize:20,fontWeight:"800",color:C.label,marginBottom:4}}>My QR Code</Text>
          <Text style={{fontSize:13,color:C.secondary,marginBottom:10}}>@sammywilliams</Text>
          <GlassView tier={2} style={{padding:16,borderRadius:20}}>{renderQRGrid()}</GlassView>
          <Text style={{fontSize:14,fontWeight:"600",color:C.secondary,marginTop:16}}>Scan to pay Sammy Williams</Text>
          <Pressable style={{marginTop:20,width:"100%"}} onPress={()=>setShowQRSheet(false)}>
            <View style={[s.outlineBtn,{borderColor:C.accent}]}><Text style={[s.outlineBtnText,{color:C.accent}]}>Scan QR Code</Text></View>
          </Pressable>
        </View>
      </BottomSheet>
    );
  }

  function renderCardSheet(){
    return(
      <BottomSheet visible={showCardSheet} onClose={()=>setShowCardSheet(false)} useModal snapPoints={["50%","100%"]}>
        <View style={{padding:20,gap:12}}>
          <Text style={{fontSize:20,fontWeight:"800",color:C.label,marginBottom:4}}>Card Controls</Text>
          {[{label:"Freeze Card",sub:"Temporarily block all transactions",icon:"snowflake"},{label:"View Card Number",sub:"Biometric authentication required",icon:"eye.slash"},{label:"Apple Pay",sub:"Added to Apple Wallet",icon:"applelogo"},{label:"Spending Limit",sub:"$5,000 / month",icon:"gauge.medium"}].map(item=>(
            <Pressable key={item.label} onPress={()=>Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)}>
              <GlassView tier={2} style={{flexDirection:"row",alignItems:"center",padding:14,borderRadius:14,gap:12}}>
                <View style={{width:40,height:40,borderRadius:20,backgroundColor:"rgba(217,119,87,0.12)",alignItems:"center",justifyContent:"center"}}>
                  <IconSymbol name={item.icon} size={20} color={C.accent}/>
                </View>
                <View style={{flex:1}}>
                  <Text style={{fontSize:14,fontWeight:"700",color:C.label}}>{item.label}</Text>
                  <Text style={{fontSize:12,color:C.secondary}}>{item.sub}</Text>
                </View>
                <IconSymbol name="chevron.right" size={14} color={C.muted}/>
              </GlassView>
            </Pressable>
          ))}
        </View>
      </BottomSheet>
    );
  }

  function renderBoostsSheet(){
    return(
      <BottomSheet visible={showBoostsSheet} onClose={()=>setShowBoostsSheet(false)} useModal snapPoints={["50%","100%"]}>
        <View style={{padding:20,gap:10}}>
          <Text style={{fontSize:20,fontWeight:"800",color:C.label,marginBottom:4}}>Boosts</Text>
          {ACTIVE_BOOSTS.map(boost=>(
            <Pressable key={boost.id} onPress={()=>Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)}>
              <GlassView tier={2} style={{flexDirection:"row",alignItems:"center",padding:14,borderRadius:14,gap:12}}>
                <View style={{width:40,height:40,borderRadius:20,backgroundColor:"rgba(217,119,87,0.12)",alignItems:"center",justifyContent:"center"}}>
                  <Text style={{fontSize:18}}>\u26A1</Text>
                </View>
                <View style={{flex:1}}>
                  <Text style={{fontSize:14,fontWeight:"700",color:C.label}}>{boost.merchant}</Text>
                  <Text style={{fontSize:12,color:C.secondary}}>{boost.category}</Text>
                </View>
                <View style={{alignItems:"flex-end",gap:4}}>
                  <Text style={{fontSize:15,fontWeight:"800",color:C.accent}}>{boost.discount}</Text>
                  <View style={{backgroundColor:boost.active?"rgba(90,138,110,0.15)":C.separator,paddingHorizontal:8,paddingVertical:3,borderRadius:8}}>
                    <Text style={{fontSize:11,fontWeight:"700",color:boost.active?C.green:C.muted}}>{boost.active?"Active":"Add"}</Text>
                  </View>
                </View>
              </GlassView>
            </Pressable>
          ))}
        </View>
      </BottomSheet>
    );
  }

  function renderRedeemSheet(){
    const opts=[{label:"Statement Credit",points:1000,value:"$10"},{label:"Gift Cards",points:1000,value:"$12"},{label:"Invest Points",points:500,value:"+$5 invested"},{label:"Donate",points:500,value:"$5 to charity"}];
    return(
      <BottomSheet visible={showRedeemSheet} onClose={()=>setShowRedeemSheet(false)} useModal snapPoints={["50%","100%"]}>
        <View style={{padding:20,gap:10}}>
          <Text style={{fontSize:20,fontWeight:"800",color:C.label}}>Redeem Points</Text>
          <Text style={{fontSize:14,color:C.secondary,marginBottom:4}}>{CAPITAL_POINTS.total.toLocaleString()+" pts available \u00B7 $"+CAPITAL_POINTS.valueUsd+" value"}</Text>
          {opts.map(opt=>(
            <Pressable key={opt.label} onPress={()=>Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium)}>
              <GlassView tier={2} style={{flexDirection:"row",alignItems:"center",padding:14,borderRadius:14}}>
                <View style={{flex:1}}>
                  <Text style={{fontSize:15,fontWeight:"700",color:C.label}}>{opt.label}</Text>
                  <Text style={{fontSize:12,color:C.secondary}}>{opt.points.toLocaleString()+" pts"}</Text>
                </View>
                <Text style={{fontSize:15,fontWeight:"800",color:C.accent}}>{opt.value}</Text>
              </GlassView>
            </Pressable>
          ))}
        </View>
      </BottomSheet>
    );
  }

  const showFilterBtn=activeTab!=="Pay";
  return(
    <View style={[s.container,{backgroundColor:C.bg}]}>
      <View style={[s.topBarOuter,{paddingTop:insets.top,height:topBarH+(pillsVisible&&activeTab==="Invest"?PILL_ROW_H:0)}]}>
        <View style={s.topBar}>
          <Pressable style={s.iconBtn} onPress={()=>{Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);openSidePanel();}}>
            <IconSymbol name="sidebar.left" size={22} color={C.label}/>
          </Pressable>
          <View style={{flex:1,alignItems:"center"}}>
            <Pressable onPress={()=>{Haptics.selectionAsync();setDropdownOpen(p=>!p);}}>
              <GlassView tier={2} style={s.dropPill}>
                <Text style={[s.dropPillText,{color:C.label}]}>{activeTab}</Text>
                <IconSymbol name={dropdownOpen?"chevron.up":"chevron.down"} size={12} color={C.secondary} style={{marginLeft:4}}/>
              </GlassView>
            </Pressable>
          </View>
          <View style={{marginRight:4}}>
            <RolePill
              role={role}
              onPress={handleCycleRole}
              accentColor={accent}
              isPrimary={isAdminRole}
            />
          </View>
          {showFilterBtn?(
            <Pressable style={s.iconBtn} onPress={togglePills}>
              <IconSymbol name="slider.horizontal.3" size={20} color={pillsVisible?C.accent:C.label}/>
            </Pressable>
          ):(
            <View style={s.iconBtn}/>
          )}
        </View>
        {activeTab==="Invest"&&(
          <Animated.View style={{height:pillsAnim.interpolate({inputRange:[0,1],outputRange:[0,PILL_ROW_H]}),opacity:pillsAnim,overflow:"hidden"}}>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{paddingHorizontal:16,paddingVertical:8,gap:8}}>
              {INVEST_FLTRS.map(f=>(
                <Pressable key={f} onPress={()=>{Haptics.selectionAsync();setInvestFilter(f);}}>
                  <GlassView tier={investFilter===f?1:2} style={{paddingHorizontal:14,paddingVertical:7,borderRadius:16}}>
                    <Text style={{fontSize:13,fontWeight:"700",color:investFilter===f?C.label:C.secondary}}>{f}</Text>
                  </GlassView>
                </Pressable>
              ))}
            </ScrollView>
          </Animated.View>
        )}
      </View>
      {activeTab==="Wallet"&&renderWalletTab()}
      {activeTab==="Pay"&&renderPayTab()}
      {activeTab==="Invest"&&renderInvestTab()}
      {dropdownOpen&&(
        <>
          <Pressable style={StyleSheet.absoluteFill} onPress={()=>setDropdownOpen(false)}/>
          <View style={[s.dropdown,{top:topBarH+4}]}>
            {KAYPAY_TABS.map(tab=>(
              <Pressable key={tab} style={[s.dropItem,tab===activeTab&&s.dropItemActive]} onPress={()=>changeTab(tab)}>
                <Text style={[s.dropItemText,{color:tab===activeTab?C.activePill:C.label}]}>{tab}</Text>
                {tab===activeTab&&<IconSymbol name="checkmark" size={14} color={C.activePill}/>}
              </Pressable>
            ))}
          </View>
        </>
      )}
      {renderSendSheet()}
      {renderQRSheet()}
      {renderCardSheet()}
      {renderBoostsSheet()}
      {renderRedeemSheet()}
    </View>
  );
}

function makeStyles(C:ComponentColors){
  return StyleSheet.create({
    container:{flex:1},
    topBarOuter:{position:"absolute",top:0,left:0,right:0,zIndex:100,backgroundColor:C.bg,borderBottomWidth:StyleSheet.hairlineWidth,borderBottomColor:C.separator},
    topBar:{flexDirection:"row",alignItems:"center",height:TOP_BAR_H,paddingHorizontal:12},
    iconBtn:{width:40,height:40,alignItems:"center",justifyContent:"center"},
    dropPill:{flexDirection:"row",alignItems:"center",paddingHorizontal:16,paddingVertical:8,borderRadius:20},
    dropPillText:{fontSize:15,fontWeight:"700"},
    rolePillInner:{paddingHorizontal:12,paddingVertical:7,borderRadius:16},
    dropdown:{position:"absolute",left:"25%",right:"25%",zIndex:200,borderRadius:16,backgroundColor:C.surface,shadowColor:"#000",shadowOpacity:0.12,shadowRadius:16,shadowOffset:{width:0,height:4},elevation:8,overflow:"hidden"},
    dropItem:{flexDirection:"row",alignItems:"center",justifyContent:"space-between",paddingHorizontal:18,paddingVertical:14,borderBottomWidth:StyleSheet.hairlineWidth,borderBottomColor:C.separator},
    dropItemActive:{backgroundColor:C.surfacePressed},
    dropItemText:{fontSize:16,fontWeight:"700"},
    balanceHero:{padding:24,borderRadius:20,marginBottom:12,alignItems:"center"},
    balanceAmt:{fontSize:48,fontWeight:"800",color:"#fff",textAlign:"center"},
    apyRow:{flexDirection:"row",alignItems:"center",gap:6,marginTop:8},
    apyDot:{width:8,height:8,borderRadius:4,backgroundColor:"#5A8A6E"},
    quickActCircle:{width:52,height:52,borderRadius:26,alignItems:"center",justifyContent:"center"},
    virtualCard:{height:90,borderRadius:16,backgroundColor:NAVY,padding:14,justifyContent:"space-between"},
    virtualCardTitle:{fontSize:12,color:"rgba(255,255,255,0.6)",fontWeight:"700",letterSpacing:1},
    virtualCardNum:{fontSize:15,fontWeight:"700",color:"#fff",letterSpacing:2},
    goalRingOuter:{width:80,height:80,borderRadius:40,alignItems:"center",justifyContent:"center"},
    goalRingInner:{width:64,height:64,borderRadius:32,alignItems:"center",justifyContent:"center"},
    txRow:{flexDirection:"row",alignItems:"center",paddingVertical:10,gap:12,borderBottomWidth:StyleSheet.hairlineWidth,borderBottomColor:C.separator},
    txAvatar:{width:40,height:40,borderRadius:20},
    txAmt:{fontWeight:"700",fontSize:15},
    ladderRow:{flexDirection:"row",alignItems:"center",paddingVertical:8,gap:12,borderBottomWidth:StyleSheet.hairlineWidth},
    infoBadge:{paddingHorizontal:8,paddingVertical:3,borderRadius:8,backgroundColor:"rgba(217,119,87,0.12)"},
    sectionHeader:{fontSize:18,fontWeight:"800",color:C.label,marginBottom:0},
    card:{padding:16,borderRadius:16,marginBottom:12},
    row:{flexDirection:"row",alignItems:"center"},
    bodyMed:{fontSize:14,fontWeight:"600"},
    bodySmall:{fontSize:13},
    giveBtn:{height:52,borderRadius:26,alignItems:"center",justifyContent:"center",marginTop:14},
    giveBtnText:{color:"#fff",fontSize:16,fontWeight:"800"},
    outlineBtn:{height:44,borderRadius:22,borderWidth:1.5,alignItems:"center",justifyContent:"center"},
    outlineBtnText:{fontSize:14,fontWeight:"700"},
  });
}
