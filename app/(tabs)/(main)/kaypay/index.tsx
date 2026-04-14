/**
 * KayPay - Financial tile for KaNeXT OS
 * Three tabs: Wallet / Pay / Invest
 * Roles: Personal / Institutional
 * Top bar: hamburger | dropdown pill | role pill | filter icon
 */

import React, { useState, useRef, useCallback, useMemo } from 'react';
import {
  View, Text, StyleSheet, Pressable, ScrollView,
  TextInput, Animated, useWindowDimensions,
} from 'react-native';
import * as Haptics from 'expo-haptics';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useFocusEffect, useRouter } from 'expo-router';
import { GlassView } from '@/components/ui/glass-view';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { BottomSheet } from '@/components/ui/bottom-sheet';
import { RolePill } from '@/components/ui/role-pill';
import { useColors, type ComponentColors } from '@/hooks/use-colors';
import { useAppContext } from '@/context/app-context';
import { openSidePanel, closeSidePanel } from '@/utils/global-side-panel';
import { resetFooter } from '@/utils/global-footer-hide';
import { useScrollHeader } from '@/hooks/use-scroll-header';
import { useDemoRole, MODE_ACCENTS } from '@/utils/demo-role-store';
import { useDataMode } from '@/utils/global-demo-mode';
import { KMenuButton } from '@/components/ui/k-menu-button';
import {
  BALANCE, APY_RATE, QUICK_RECIPIENTS, CARD_INFO,
  INFRA_FUND, CAPITAL_POINTS, REMITTANCE_RECIPIENTS,
  ACTIVE_SPLIT, ACTIVE_BOOSTS, MONTHLY_SUMMARY, INSTITUTIONAL_WALLET,
  TRANSACTION_FILTERS, getTransactions, formatCurrency, formatCompact,
  type Transaction, type QuickRecipient, type TransactionFilterKey,
} from '@/data/mock-wallet';
import { OWNER_TXS, FOLLOWER_TXS, type KPayTx } from '@/data/mock-personal-kaypay';

const NAVY='#1A1714';
const GAIN='#5A8A6E';
const HEAT='#B85C5C';
const TOP_BAR_H=52;
const PILL_ROW_H=48;

// ── Business Mode: CEO Finance View ───────────────────────────────────────
type BusinessViewProps={C:ComponentColors;openSidePanel:()=>void;cycleRole:()=>void;role:string};
type FinanceTab='Overview'|'AR'|'AP'|'Payroll'|'Expenses'|'Reports';
const BIZ_FIN_TABS:FinanceTab[]=['Overview','AR','AP','Payroll','Expenses','Reports'];

function BusinessCEOFinanceView({C,openSidePanel:openPanel,cycleRole,role}:BusinessViewProps){
  const insets=useSafeAreaInsets();
  const topBarH=insets.top+TOP_BAR_H;
  const [finTab,setFinTab]=useState<FinanceTab>('Overview');
  const [dropOpen,setDropOpen]=useState(false);

  const CASH_FLOW=[
    {month:'Nov',inAmt:48200,outAmt:51400,net:-3200},
    {month:'Dec',inAmt:62100,outAmt:54800,net:7300},
    {month:'Jan',inAmt:44700,outAmt:49100,net:-4400},
    {month:'Feb',inAmt:71300,outAmt:58600,net:12700},
    {month:'Mar',inAmt:55800,outAmt:61200,net:-5400},
    {month:'Apr',inAmt:32500,outAmt:18200,net:14300},
  ];
  const maxCashFlow=Math.max(...CASH_FLOW.flatMap(r=>[r.inAmt,r.outAmt]));

  return(
    <View style={{flex:1,backgroundColor:C.bg}}>
      {/* Top bar */}
      <View style={{position:'absolute',top:0,left:0,right:0,zIndex:100,backgroundColor:C.bg,borderBottomWidth:StyleSheet.hairlineWidth,borderBottomColor:C.separator,paddingTop:insets.top,height:topBarH}}>
        <View style={{flexDirection:'row',alignItems:'center',height:TOP_BAR_H,paddingHorizontal:12}}>
          <Pressable style={{width:40,height:40,alignItems:'center',justifyContent:'center'}} onPress={()=>{Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);openPanel();}}>
            <KMenuButton />
          </Pressable>
          <View style={{flex:1,alignItems:'center'}}>
            <Pressable onPress={()=>{Haptics.selectionAsync();setDropOpen(p=>!p);}}>
              <GlassView tier={2} style={{flexDirection:'row',alignItems:'center',paddingHorizontal:16,paddingVertical:8,borderRadius:20}}>
                <Text style={{fontSize:15,fontWeight:'700',color:C.label}}>{finTab}</Text>
                <IconSymbol name={dropOpen?'chevron.up':'chevron.down'} size={12} color={C.secondary} style={{marginLeft:4}}/>
              </GlassView>
            </Pressable>
          </View>
          <View style={{marginRight:4}}>
            <RolePill role={role} onPress={()=>{cycleRole();}} accentColor={C.accent} isPrimary={true}/>
          </View>
          <View style={{width:40,height:40}}/>
        </View>
      </View>

      {/* Tab dropdown */}
      {dropOpen&&(
        <>
          <Pressable style={StyleSheet.absoluteFill} onPress={()=>setDropOpen(false)}/>
          <View style={{position:'absolute',top:topBarH+4,left:'20%',right:'20%',zIndex:200,borderRadius:16,backgroundColor:C.surface,shadowColor:'#000',shadowOpacity:0.12,shadowRadius:16,shadowOffset:{width:0,height:4},elevation:8,overflow:'hidden'}}>
            {BIZ_FIN_TABS.map((tab,i)=>(
              <Pressable key={tab} onPress={()=>{Haptics.selectionAsync();setFinTab(tab);setDropOpen(false);}}
                style={{paddingHorizontal:18,paddingVertical:14,borderBottomWidth:i<BIZ_FIN_TABS.length-1?StyleSheet.hairlineWidth:0,borderBottomColor:C.separator,flexDirection:'row',alignItems:'center',justifyContent:'space-between',backgroundColor:tab===finTab?C.surfacePressed:'transparent'}}>
                <Text style={{fontSize:16,fontWeight:'700',color:tab===finTab?C.label:C.secondary}}>{tab}</Text>
                {tab===finTab&&<IconSymbol name="checkmark" size={14} color={C.label}/>}
              </Pressable>
            ))}
          </View>
        </>
      )}

      <ScrollView showsVerticalScrollIndicator={false} onScroll={onScroll} scrollEventThrottle={scrollEventThrottle} contentContainerStyle={{padding:16,paddingBottom:120,paddingTop:topBarH+8}}>

        {/* OVERVIEW TAB */}
        {finTab==='Overview'&&(
          <>
            {/* Cash position hero */}
            <GlassView tier={1} style={{padding:24,borderRadius:20,marginBottom:12,alignItems:'center',backgroundColor:C.label}}>
              <Text style={{fontSize:13,color:'rgba(255,255,255,0.55)',fontWeight:'600',textAlign:'center',marginBottom:4}}>Cash Position</Text>
              <Text style={{fontSize:48,fontWeight:'800',color:'#fff',textAlign:'center'}}>$284,500</Text>
            </GlassView>

            {/* Stat pills */}
            <View style={{flexDirection:'row',gap:10,marginBottom:16}}>
              {[{label:'MRR',value:'$12,285'},{label:'Burn Rate',value:'$18K/mo'},{label:'Runway',value:'15.8 mo'}].map(stat=>(
                <GlassView key={stat.label} tier={1} style={{flex:1,padding:12,borderRadius:14,alignItems:'center',gap:4}}>
                  <Text style={{fontSize:16,fontWeight:'800',color:C.label}}>{stat.value}</Text>
                  <Text style={{fontSize:11,color:C.secondary}}>{stat.label}</Text>
                </GlassView>
              ))}
            </View>

            {/* Cash flow chart */}
            <GlassView tier={1} style={{padding:16,borderRadius:16,marginBottom:12}}>
              <Text style={{fontSize:16,fontWeight:'800',color:C.label,marginBottom:12}}>Cash Flow — 6 Months</Text>
              {CASH_FLOW.map(row=>{
                const inW=Math.max(4,(row.inAmt/maxCashFlow)*140);
                const outW=Math.max(4,(row.outAmt/maxCashFlow)*140);
                const netPos=row.net>=0;
                return(
                  <View key={row.month} style={{flexDirection:'row',alignItems:'center',marginBottom:10,gap:8}}>
                    <Text style={{width:32,fontSize:12,fontWeight:'600',color:C.secondary}}>{row.month}</Text>
                    <View style={{flex:1,gap:3}}>
                      <View style={{height:7,width:inW,backgroundColor:C.label,borderRadius:4}}/>
                      <View style={{height:7,width:outW,backgroundColor:C.separator,borderRadius:4}}/>
                    </View>
                    <Text style={{width:58,fontSize:12,fontWeight:'700',color:netPos?C.green:C.red,textAlign:'right'}}>{netPos?'+':''}{row.net>=0?'$'+Math.round(row.net/1000)+'K':'-$'+Math.round(Math.abs(row.net)/1000)+'K'}</Text>
                  </View>
                );
              })}
            </GlassView>

            {/* Recent transactions */}
            <Text style={{fontSize:18,fontWeight:'800',color:C.label,marginBottom:10}}>Recent Transactions</Text>
            {[
              {desc:'Payroll Run',          date:'Apr 1',  amount:-47200},
              {desc:'LU Oakland Invoice',   date:'Apr 1',  amount:8500},
              {desc:'AWS',                  date:'Mar 31', amount:-1840},
              {desc:'NAIA Deal',            date:'Mar 28', amount:24000},
              {desc:'Office Rent',          date:'Mar 25', amount:-4200},
            ].map((tx,i,arr)=>(
              <View key={i} style={{flexDirection:'row',alignItems:'center',justifyContent:'space-between',paddingVertical:12,borderBottomWidth:i<arr.length-1?StyleSheet.hairlineWidth:0,borderBottomColor:C.separator}}>
                <View>
                  <Text style={{fontSize:14,fontWeight:'600',color:C.label}}>{tx.desc}</Text>
                  <Text style={{fontSize:12,color:C.secondary}}>{tx.date}</Text>
                </View>
                <Text style={{fontSize:14,fontWeight:'700',color:tx.amount>=0?C.green:C.red}}>{tx.amount>=0?'+':'-'}${Math.abs(tx.amount).toLocaleString()}</Text>
              </View>
            ))}

            {/* Pending */}
            <GlassView tier={2} style={{marginTop:14,padding:14,borderRadius:14,flexDirection:'row',alignItems:'center',gap:10}}>
              <IconSymbol name="clock.fill" size={18} color={C.secondary}/>
              <Text style={{fontSize:13,color:C.secondary,flex:1}}>3 invoices awaiting payment · 2 expenses pending approval</Text>
            </GlassView>
          </>
        )}

        {/* AR TAB */}
        {finTab==='AR'&&(
          <>
            <GlassView tier={1} style={{padding:20,borderRadius:16,marginBottom:14,alignItems:'center'}}>
              <Text style={{fontSize:12,fontWeight:'600',color:C.secondary,marginBottom:4}}>Total Outstanding</Text>
              <Text style={{fontSize:36,fontWeight:'800',color:C.label}}>$47,300</Text>
            </GlassView>

            {/* Aging */}
            <Text style={{fontSize:18,fontWeight:'800',color:C.label,marginBottom:10}}>Aging</Text>
            {[
              {range:'0–30 days',  amount:32100, color:C.green},
              {range:'31–60 days', amount:9800,  color:C.amber},
              {range:'61–90 days', amount:5400,  color:C.red},
            ].map(row=>(
              <View key={row.range} style={{flexDirection:'row',alignItems:'center',justifyContent:'space-between',paddingVertical:12,borderBottomWidth:StyleSheet.hairlineWidth,borderBottomColor:C.separator}}>
                <View style={{flexDirection:'row',alignItems:'center',gap:8}}>
                  <View style={{width:10,height:10,borderRadius:5,backgroundColor:row.color}}/>
                  <Text style={{fontSize:14,fontWeight:'600',color:C.label}}>{row.range}</Text>
                </View>
                <Text style={{fontSize:15,fontWeight:'700',color:row.color}}>${row.amount.toLocaleString()}</Text>
              </View>
            ))}

            {/* Invoice list */}
            <Text style={{fontSize:18,fontWeight:'800',color:C.label,marginTop:16,marginBottom:10}}>Invoices</Text>
            {[
              {client:'LU Oakland',    amount:8500,  status:'Pending',  overdue:false},
              {client:'NAIA Mandate',  amount:24000, status:'Paid',     overdue:false},
              {client:'Riverside USD', amount:14800, status:'Overdue',  overdue:true},
            ].map((inv,i,arr)=>(
              <GlassView key={inv.client} tier={1} style={{padding:14,borderRadius:14,marginBottom:10}}>
                <View style={{flexDirection:'row',alignItems:'center',justifyContent:'space-between',marginBottom:inv.overdue?8:0}}>
                  <View>
                    <Text style={{fontSize:14,fontWeight:'700',color:C.label}}>{inv.client}</Text>
                    <Text style={{fontSize:12,color:C.secondary,marginTop:2}}>${inv.amount.toLocaleString()}</Text>
                  </View>
                  <View style={{backgroundColor:inv.status==='Paid'?C.green+'22':inv.status==='Overdue'?C.red+'22':C.amber+'22',paddingHorizontal:10,paddingVertical:4,borderRadius:10}}>
                    <Text style={{fontSize:12,fontWeight:'700',color:inv.status==='Paid'?C.green:inv.status==='Overdue'?C.red:C.amber}}>{inv.status}</Text>
                  </View>
                </View>
                {inv.overdue&&(
                  <Pressable onPress={()=>Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)} style={{marginTop:8,paddingVertical:8,borderRadius:10,borderWidth:1,borderColor:C.red,alignItems:'center'}}>
                    <Text style={{fontSize:13,fontWeight:'700',color:C.red}}>Send Reminder</Text>
                  </Pressable>
                )}
              </GlassView>
            ))}

            {/* Create Invoice */}
            <Pressable onPress={()=>Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium)} style={{marginTop:4}}>
              <View style={{height:52,borderRadius:26,backgroundColor:C.label,alignItems:'center',justifyContent:'center'}}>
                <Text style={{fontSize:16,fontWeight:'800',color:C.bg}}>Create Invoice</Text>
              </View>
            </Pressable>
          </>
        )}

        {/* AP TAB */}
        {finTab==='AP'&&(
          <>
            <Text style={{fontSize:18,fontWeight:'800',color:C.label,marginBottom:14}}>Bills</Text>
            {[
              {vendor:'AWS',            amount:1840,  status:'Due'},
              {vendor:'Stripe',         amount:420,   status:'Due'},
              {vendor:'WeWork',         amount:4200,  status:'Paid'},
              {vendor:'Gusto',          amount:890,   status:'Due'},
            ].map((bill,i,arr)=>(
              <View key={bill.vendor} style={{flexDirection:'row',alignItems:'center',justifyContent:'space-between',paddingVertical:14,borderBottomWidth:i<arr.length-1?StyleSheet.hairlineWidth:0,borderBottomColor:C.separator}}>
                <View>
                  <Text style={{fontSize:14,fontWeight:'600',color:C.label}}>{bill.vendor}</Text>
                  <Text style={{fontSize:12,color:C.secondary,marginTop:2}}>${bill.amount.toLocaleString()}</Text>
                </View>
                {bill.status==='Paid'?(
                  <View style={{backgroundColor:C.green+'22',paddingHorizontal:12,paddingVertical:6,borderRadius:10}}>
                    <Text style={{fontSize:13,fontWeight:'700',color:C.green}}>Paid</Text>
                  </View>
                ):(
                  <Pressable onPress={()=>Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium)} style={{paddingHorizontal:16,paddingVertical:8,borderRadius:10,backgroundColor:C.label}}>
                    <Text style={{fontSize:13,fontWeight:'700',color:C.bg}}>Pay</Text>
                  </Pressable>
                )}
              </View>
            ))}
          </>
        )}

        {/* PAYROLL TAB */}
        {finTab==='Payroll'&&(
          <>
            {/* Run payroll card */}
            <GlassView tier={1} style={{padding:20,borderRadius:16,marginBottom:14}}>
              <View style={{flexDirection:'row',alignItems:'center',justifyContent:'space-between'}}>
                <View>
                  <Text style={{fontSize:13,fontWeight:'600',color:C.secondary}}>Next Payroll</Text>
                  <Text style={{fontSize:20,fontWeight:'800',color:C.label,marginTop:2}}>Apr 15, 2026</Text>
                  <Text style={{fontSize:13,color:C.secondary,marginTop:2}}>Est. $47,200</Text>
                </View>
                <Pressable onPress={()=>Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium)} style={{paddingHorizontal:18,paddingVertical:10,borderRadius:14,backgroundColor:C.label}}>
                  <Text style={{fontSize:14,fontWeight:'800',color:C.bg}}>Run Payroll</Text>
                </Pressable>
              </View>
            </GlassView>

            {/* Employee list */}
            <Text style={{fontSize:18,fontWeight:'800',color:C.label,marginBottom:10}}>Employees</Text>
            {[
              {name:'Sammy Kalejaiye',   title:'CEO',     salary:6923},
              {name:'Marcus Williams',   title:'CTO',     salary:6154},
              {name:'Diana Chen',        title:'Product', salary:5385},
              {name:'+ 8 more',          title:'',        salary:null},
            ].map((emp,i,arr)=>(
              <View key={emp.name} style={{flexDirection:'row',alignItems:'center',justifyContent:'space-between',paddingVertical:12,borderBottomWidth:i<arr.length-1?StyleSheet.hairlineWidth:0,borderBottomColor:C.separator}}>
                <View>
                  <Text style={{fontSize:14,fontWeight:'600',color:C.label}}>{emp.name}</Text>
                  {emp.title?<Text style={{fontSize:12,color:C.secondary,marginTop:2}}>{emp.title}</Text>:null}
                </View>
                {emp.salary!=null&&<Text style={{fontSize:14,fontWeight:'700',color:C.label}}>${emp.salary.toLocaleString()}/mo</Text>}
              </View>
            ))}

            {/* Last 3 payroll runs */}
            <Text style={{fontSize:18,fontWeight:'800',color:C.label,marginTop:16,marginBottom:10}}>Recent Runs</Text>
            {[
              {date:'Apr 1, 2026', total:47200},
              {date:'Mar 15, 2026',total:47200},
              {date:'Mar 1, 2026', total:46850},
            ].map((run,i,arr)=>(
              <View key={run.date} style={{flexDirection:'row',alignItems:'center',justifyContent:'space-between',paddingVertical:12,borderBottomWidth:i<arr.length-1?StyleSheet.hairlineWidth:0,borderBottomColor:C.separator}}>
                <Text style={{fontSize:14,fontWeight:'600',color:C.label}}>{run.date}</Text>
                <Text style={{fontSize:14,fontWeight:'700',color:C.red}}>-${run.total.toLocaleString()}</Text>
              </View>
            ))}
          </>
        )}

        {/* EXPENSES TAB */}
        {finTab==='Expenses'&&(
          <>
            <Text style={{fontSize:18,fontWeight:'800',color:C.label,marginBottom:10}}>Pending Approval</Text>
            {[
              {name:'Kevin Moore',  desc:'Team Lunch',  amount:124},
              {name:'Tara Osei',    desc:'Conference',  amount:890},
            ].map((exp,i)=>(
              <GlassView key={i} tier={1} style={{padding:14,borderRadius:14,marginBottom:10}}>
                <View style={{flexDirection:'row',alignItems:'center',justifyContent:'space-between',marginBottom:10}}>
                  <View>
                    <Text style={{fontSize:14,fontWeight:'700',color:C.label}}>{exp.name}</Text>
                    <Text style={{fontSize:12,color:C.secondary,marginTop:2}}>{exp.desc} · ${exp.amount}</Text>
                  </View>
                </View>
                <View style={{flexDirection:'row',gap:10}}>
                  <Pressable onPress={()=>Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium)} style={{flex:1,paddingVertical:9,borderRadius:10,backgroundColor:C.label,alignItems:'center'}}>
                    <Text style={{fontSize:13,fontWeight:'700',color:C.bg}}>Approve</Text>
                  </Pressable>
                  <Pressable onPress={()=>Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)} style={{flex:1,paddingVertical:9,borderRadius:10,borderWidth:1,borderColor:C.red,alignItems:'center'}}>
                    <Text style={{fontSize:13,fontWeight:'700',color:C.red}}>Deny</Text>
                  </Pressable>
                </View>
              </GlassView>
            ))}

            {/* Budget bars */}
            <Text style={{fontSize:18,fontWeight:'800',color:C.label,marginTop:8,marginBottom:10}}>Budget by Category</Text>
            {[
              {category:'Travel',   spent:2400, budget:5000},
              {category:'Meals',    spent:890,  budget:2000},
              {category:'Software', spent:3200, budget:4000},
            ].map(cat=>{
              const pct=cat.spent/cat.budget;
              const over=pct>1;
              return(
                <View key={cat.category} style={{marginBottom:14}}>
                  <View style={{flexDirection:'row',justifyContent:'space-between',marginBottom:5}}>
                    <Text style={{fontSize:13,fontWeight:'600',color:C.label}}>{cat.category}</Text>
                    <Text style={{fontSize:12,color:over?C.red:C.secondary}}>${cat.spent.toLocaleString()} / ${cat.budget.toLocaleString()}</Text>
                  </View>
                  <View style={{height:7,backgroundColor:C.separator,borderRadius:4,overflow:'hidden'}}>
                    <View style={{height:7,width:`${Math.min(100,Math.round(pct*100))}%` as any,backgroundColor:over?C.red:C.label,borderRadius:4}}/>
                  </View>
                </View>
              );
            })}
          </>
        )}

        {/* REPORTS TAB */}
        {finTab==='Reports'&&(
          <>
            <Text style={{fontSize:18,fontWeight:'800',color:C.label,marginBottom:14}}>Financial Reports</Text>
            {[
              {title:'Profit & Loss',    sub:'Jan – Mar 2026 · Q1', icon:'doc.text'},
              {title:'Balance Sheet',    sub:'As of Apr 1, 2026',   icon:'doc.plaintext'},
              {title:'Cash Flow',        sub:'Jan – Mar 2026 · Q1', icon:'arrow.left.arrow.right'},
            ].map(rep=>(
              <GlassView key={rep.title} tier={1} style={{flexDirection:'row',alignItems:'center',gap:14,padding:16,borderRadius:14,marginBottom:10}}>
                <View style={{width:40,height:40,borderRadius:10,backgroundColor:C.surfacePressed,alignItems:'center',justifyContent:'center'}}>
                  <IconSymbol name={rep.icon as any} size={18} color={C.label}/>
                </View>
                <View style={{flex:1}}>
                  <Text style={{fontSize:14,fontWeight:'700',color:C.label}}>{rep.title}</Text>
                  <Text style={{fontSize:12,color:C.secondary,marginTop:2}}>{rep.sub}</Text>
                </View>
                <Pressable onPress={()=>Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)} style={{paddingHorizontal:12,paddingVertical:6,borderRadius:10,borderWidth:1,borderColor:C.separator}}>
                  <Text style={{fontSize:12,fontWeight:'600',color:C.label}}>Generate</Text>
                </Pressable>
              </GlassView>
            ))}
            <View style={{flexDirection:'row',gap:10,marginTop:8}}>
              <Pressable onPress={()=>Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)} style={{flex:1,height:44,borderRadius:22,borderWidth:1.5,borderColor:C.label,alignItems:'center',justifyContent:'center'}}>
                <Text style={{fontSize:14,fontWeight:'700',color:C.label}}>Export CSV</Text>
              </Pressable>
              <Pressable onPress={()=>Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)} style={{flex:1,height:44,borderRadius:22,backgroundColor:C.label,alignItems:'center',justifyContent:'center'}}>
                <Text style={{fontSize:14,fontWeight:'700',color:C.bg}}>Export PDF</Text>
              </Pressable>
            </View>
          </>
        )}
      </ScrollView>
    </View>
  );
}

// ── Business Mode: Customer Billing View ───────────────────────────────────
function BusinessCustomerBillingView({C,openSidePanel:openPanel,cycleRole,role}:BusinessViewProps){
  const insets=useSafeAreaInsets();
  const topBarH=insets.top+TOP_BAR_H;

  return(
    <View style={{flex:1,backgroundColor:C.bg}}>
      {/* Top bar */}
      <View style={{position:'absolute',top:0,left:0,right:0,zIndex:100,backgroundColor:C.bg,borderBottomWidth:StyleSheet.hairlineWidth,borderBottomColor:C.separator,paddingTop:insets.top,height:topBarH}}>
        <View style={{flexDirection:'row',alignItems:'center',height:TOP_BAR_H,paddingHorizontal:12}}>
          <Pressable style={{width:40,height:40,alignItems:'center',justifyContent:'center'}} onPress={()=>{Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);openPanel();}}>
            <KMenuButton />
          </Pressable>
          <View style={{flex:1,alignItems:'center'}}>
            <Text style={{fontSize:17,fontWeight:'700',color:C.label}}>Billing</Text>
          </View>
          <View style={{marginRight:4}}>
            <RolePill role={role} onPress={()=>{cycleRole();}} accentColor={C.accent} isPrimary={false}/>
          </View>
          <View style={{width:40,height:40}}/>
        </View>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} onScroll={onScroll} scrollEventThrottle={scrollEventThrottle} contentContainerStyle={{padding:16,paddingBottom:120,paddingTop:topBarH+8}}>

        {/* Outstanding balance */}
        <GlassView tier={1} style={{padding:24,borderRadius:20,marginBottom:16,backgroundColor:C.surface}}>
          <Text style={{fontSize:12,fontWeight:'600',color:C.secondary,marginBottom:4}}>Outstanding Balance</Text>
          <Text style={{fontSize:36,fontWeight:'800',color:C.label,marginBottom:4}}>$8,500</Text>
          <Text style={{fontSize:13,color:C.secondary,marginBottom:16}}>Due Apr 15, 2026</Text>
          <Pressable onPress={()=>Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium)}>
            <View style={{height:48,borderRadius:24,backgroundColor:C.label,alignItems:'center',justifyContent:'center'}}>
              <Text style={{fontSize:16,fontWeight:'800',color:C.bg}}>Pay Now</Text>
            </View>
          </Pressable>
        </GlassView>

        {/* Invoices */}
        <Text style={{fontSize:18,fontWeight:'800',color:C.label,marginBottom:10}}>Invoices</Text>
        {[
          {inv:'INV-2026-014',amount:8500, status:'Pending'},
          {inv:'INV-2026-009',amount:8500, status:'Paid'},
          {inv:'INV-2026-003',amount:3200, status:'Paid'},
        ].map((invoice,i,arr)=>(
          <View key={invoice.inv} style={{flexDirection:'row',alignItems:'center',justifyContent:'space-between',paddingVertical:14,borderBottomWidth:i<arr.length-1?StyleSheet.hairlineWidth:0,borderBottomColor:C.separator}}>
            <View>
              <Text style={{fontSize:14,fontWeight:'600',color:C.label}}>{invoice.inv}</Text>
              <Text style={{fontSize:12,color:C.secondary,marginTop:2}}>${invoice.amount.toLocaleString()}</Text>
            </View>
            <View style={{flexDirection:'row',alignItems:'center',gap:10}}>
              <View style={{backgroundColor:invoice.status==='Paid'?C.green+'22':C.amber+'22',paddingHorizontal:10,paddingVertical:4,borderRadius:10}}>
                <Text style={{fontSize:12,fontWeight:'700',color:invoice.status==='Paid'?C.green:C.amber}}>{invoice.status}</Text>
              </View>
              <Pressable onPress={()=>Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)}>
                <IconSymbol name="arrow.down.to.line" size={16} color={C.secondary}/>
              </Pressable>
            </View>
          </View>
        ))}

        {/* Payment methods */}
        <Text style={{fontSize:18,fontWeight:'800',color:C.label,marginTop:20,marginBottom:10}}>Payment Methods</Text>
        <GlassView tier={1} style={{padding:14,borderRadius:14,marginBottom:10,flexDirection:'row',alignItems:'center',justifyContent:'space-between'}}>
          <View style={{flexDirection:'row',alignItems:'center',gap:12}}>
            <View style={{width:40,height:40,borderRadius:10,backgroundColor:C.surfacePressed,alignItems:'center',justifyContent:'center'}}>
              <IconSymbol name="creditcard.fill" size={18} color={C.label}/>
            </View>
            <View>
              <Text style={{fontSize:14,fontWeight:'600',color:C.label}}>Visa ••••4242</Text>
              <Text style={{fontSize:12,color:C.secondary,marginTop:2}}>Default</Text>
            </View>
          </View>
          <IconSymbol name="checkmark.circle.fill" size={20} color={C.green}/>
        </GlassView>
        <Pressable onPress={()=>Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)} style={{marginBottom:4}}>
          <View style={{height:44,borderRadius:22,borderWidth:1.5,borderColor:C.separator,alignItems:'center',justifyContent:'center'}}>
            <Text style={{fontSize:14,fontWeight:'700',color:C.label}}>+ Add Payment Method</Text>
          </View>
        </Pressable>

        {/* Payment history */}
        <Text style={{fontSize:18,fontWeight:'800',color:C.label,marginTop:20,marginBottom:10}}>Payment History</Text>
        {[
          {date:'Jan 8, 2026', amount:8500},
          {date:'Oct 10, 2025',amount:3200},
        ].map((pay,i,arr)=>(
          <View key={i} style={{flexDirection:'row',alignItems:'center',justifyContent:'space-between',paddingVertical:12,borderBottomWidth:i<arr.length-1?StyleSheet.hairlineWidth:0,borderBottomColor:C.separator}}>
            <Text style={{fontSize:14,fontWeight:'600',color:C.label}}>{pay.date}</Text>
            <Text style={{fontSize:14,fontWeight:'700',color:C.red}}>-${pay.amount.toLocaleString()}</Text>
          </View>
        ))}

        {/* Billing contact */}
        <Text style={{fontSize:18,fontWeight:'800',color:C.label,marginTop:20,marginBottom:10}}>Billing Contact</Text>
        <GlassView tier={1} style={{padding:14,borderRadius:14,flexDirection:'row',alignItems:'center',justifyContent:'space-between'}}>
          <View>
            <Text style={{fontSize:14,fontWeight:'600',color:C.label}}>accounts@luoakland.edu</Text>
            <Text style={{fontSize:12,color:C.secondary,marginTop:2}}>Lincoln University Oakland</Text>
          </View>
          <Pressable onPress={()=>Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)} style={{paddingHorizontal:12,paddingVertical:6,borderRadius:10,borderWidth:1,borderColor:C.separator}}>
            <Text style={{fontSize:12,fontWeight:'600',color:C.label}}>Update</Text>
          </Pressable>
        </GlassView>

      </ScrollView>
    </View>
  );
}
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
  personal:  'personal:kaypay',
};

// ── Live Mode Public View ──────────────────────────────────────────────────

function LiveKpayView({ mode, C, insets }: { mode: string; C: any; insets: any }) {
  const payInfo = {
    personal: { name: 'Sammy Kalejaiye', desc: 'Send a payment or tip directly to Sammy.' },
    business: { name: 'KaNeXT LLC', desc: 'Pay an invoice or purchase a product or service from KaNeXT.' },
    education: { name: 'Lincoln University', desc: 'Pay tuition, fees, or application fee.' },
    community: { name: 'ICCLA', desc: 'Give to ICCLA. Every contribution supports our mission.' },
    sports: { name: "LU Men's Basketball", desc: 'Buy merch, tickets, or support the program.' },
  }[mode] ?? { name: 'KaNeXT', desc: 'Send a payment.' };

  return (
    <View style={{ flex: 1, backgroundColor: C.bg }}>
      <View style={{ height: insets.top + 52, backgroundColor: C.bg }} />
      <View style={{ paddingHorizontal: 20, paddingTop: 24, gap: 20 }}>
        {/* Recipient card */}
        <View style={{ backgroundColor: C.surface, borderRadius: 16, padding: 20, gap: 10, alignItems: 'center' }}>
          <Text style={{ fontSize: 18, fontWeight: '700', color: C.label }}>{payInfo.name}</Text>
          <Text style={{ fontSize: 14, color: C.secondary, textAlign: 'center' }}>{payInfo.desc}</Text>
        </View>
        {/* Amount input area (static display) */}
        <View style={{ backgroundColor: C.surface, borderRadius: 16, padding: 20, gap: 12 }}>
          <Text style={{ fontSize: 13, fontWeight: '600', color: C.secondary, textTransform: 'uppercase', letterSpacing: 0.5 }}>Amount</Text>
          <View style={{ backgroundColor: C.bg, borderRadius: 12, borderWidth: 1, borderColor: C.separator, padding: 16 }}>
            <Text style={{ fontSize: 28, fontWeight: '700', color: C.secondary }}>$0.00</Text>
          </View>
          {/* Preset amounts */}
          <View style={{ flexDirection: 'row', gap: 10 }}>
            {['$25', '$50', '$100', '$250'].map(amt => (
              <View key={amt} style={{ flex: 1, backgroundColor: C.bg, borderRadius: 10, borderWidth: 1, borderColor: C.separator, padding: 10, alignItems: 'center' }}>
                <Text style={{ fontSize: 13, fontWeight: '600', color: C.secondary }}>{amt}</Text>
              </View>
            ))}
          </View>
        </View>
        {/* CTA */}
        <Pressable style={{ backgroundColor: C.label, borderRadius: 14, padding: 16, alignItems: 'center' }}>
          <Text style={{ fontSize: 16, fontWeight: '700', color: C.bg }}>Continue with KPay</Text>
        </Pressable>
        <Text style={{ fontSize: 12, color: C.secondary, textAlign: 'center' }}>Sign in to KaNeXT to complete your payment.</Text>
      </View>
    </View>
  );
}


// ── PersonalKPayView — Wallet Hub ─────────────────────────────────────────────

function PersonalKPayView({
  C, insets, role, cycleRole, isOwner,
}: {
  C: ComponentColors;
  insets: { top: number; bottom: number };
  role: string;
  cycleRole: () => void;
  isOwner: boolean;
}) {
  const kpTopBarH = insets.top + TOP_BAR_H;
  const kpScrollH = useScrollHeader(kpTopBarH);
  const router = useRouter();
  const [sendVisible, setSendVisible] = useState(false);
  const [reqVisible,  setReqVisible]  = useState(false);
  const [sendAmount,  setSendAmount]  = useState('');
  const [sendTo,      setSendTo]      = useState('');
  const [sendNote,    setSendNote]    = useState('');

  const KPGAIN    = '#5A8A6E';
  const KPHEAT    = '#B85C5C';
  const KPCAUTION = '#B8943E';

  const goEarnings = () => router.navigate('/(tabs)/(main)/kaypay/personal-earnings' as any);
  const goActivity = () => router.navigate('/(tabs)/(main)/kaypay/personal-activity' as any);
  const goCard     = () => router.navigate('/(tabs)/(main)/kaypay/personal-card'     as any);
  const goSavings  = () => router.navigate('/(tabs)/(main)/kaypay/personal-savings'  as any);

  const recentTxs = (isOwner ? OWNER_TXS : FOLLOWER_TXS).slice(0, 5);

  const TOP_SOURCES = [
    { label: 'Store sales',    amount: 1800, pct: 43, color: C.label   },
    { label: 'Subscriptions', amount: 1200, pct: 29, color: KPGAIN    },
    { label: 'Bookings',      amount:  600, pct: 14, color: KPCAUTION },
  ];

  // ── Reusable sub-components ───────────────────────────────────────────────

  const SectionHeader = ({ title, linkLabel, onLink }: { title: string; linkLabel?: string; onLink?: () => void }) => (
    <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
      <Text style={{ fontSize: 11, fontWeight: '700', color: C.secondary, textTransform: 'uppercase', letterSpacing: 0.8 }}>{title}</Text>
      {linkLabel && onLink && (
        <Pressable onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); onLink(); }}>
          <Text style={{ fontSize: 13, fontWeight: '600', color: C.label }}>See all</Text>
        </Pressable>
      )}
    </View>
  );

  return (
    <View style={{ flex: 1, backgroundColor: C.bg }}>

      {/* ── Top bar ── */}
      <Animated.View style={{
        position: 'absolute', top: 0, left: 0, right: 0, zIndex: 20,
        height: kpTopBarH, paddingTop: insets.top, backgroundColor: C.bg,
        opacity: kpScrollH.opacity,
        borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: C.separator,
      }}>
        <View style={{ flex: 1, flexDirection: 'row', alignItems: 'flex-end', paddingHorizontal: 16, paddingBottom: 10 }}>
          <View style={{ flex: 1 }}>
            <Pressable onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); openSidePanel(); }}>
              <KMenuButton />
            </Pressable>
          </View>
          <View style={{ backgroundColor: C.surface, borderRadius: 18, paddingHorizontal: 14, paddingVertical: 6 }}>
            <Text style={{ fontSize: 13, fontWeight: '700', color: C.label }}>Wallet</Text>
          </View>
          <View style={{ flex: 1, flexDirection: 'row', justifyContent: 'flex-end', alignItems: 'center' }}>
            <RolePill role={role} onPress={cycleRole} accentColor={C.label} isPrimary={isOwner} />
          </View>
        </View>
      </Animated.View>

      {/* ── Scrollable content ── */}
      <ScrollView
        onScroll={kpScrollH.onScroll}
        scrollEventThrottle={kpScrollH.scrollEventThrottle}
        contentContainerStyle={{ paddingTop: kpTopBarH, paddingBottom: insets.bottom + 80 }}
        showsVerticalScrollIndicator={false}
      >

        {/* ── Balance card ── */}
        <View style={{ marginHorizontal: 16, marginTop: 20, backgroundColor: C.surface, borderRadius: 24, padding: 24, alignItems: 'center' }}>
          {/* APY badge */}
          <View style={{ backgroundColor: `${KPGAIN}20`, borderRadius: 20, paddingHorizontal: 12, paddingVertical: 5, marginBottom: 12 }}>
            <Text style={{ fontSize: 12, fontWeight: '700', color: KPGAIN }}>{isOwner ? '4% APY' : '4.15% APY'}</Text>
          </View>
          {/* Balance */}
          <Text style={{ fontSize: 38, fontWeight: '800', color: C.label, letterSpacing: -1.5 }}>
            {isOwner ? '$4,247.83' : '$342.50'}
          </Text>
          <Text style={{ fontSize: 14, color: C.secondary, marginTop: 5, marginBottom: 24 }}>Checking</Text>

          {/* Add Money / Cash Out */}
          <View style={{ flexDirection: 'row', gap: 12, width: '100%', marginBottom: 24 }}>
            <Pressable
              onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); setReqVisible(true); }}
              style={{ flex: 1, height: 46, borderRadius: 23, borderWidth: 1.5, borderColor: C.label, alignItems: 'center', justifyContent: 'center' }}
            >
              <Text style={{ fontSize: 15, fontWeight: '700', color: C.label }}>Add Money</Text>
            </Pressable>
            <Pressable
              onPress={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)}
              style={{ flex: 1, height: 46, borderRadius: 23, borderWidth: 1.5, borderColor: C.label, alignItems: 'center', justifyContent: 'center' }}
            >
              <Text style={{ fontSize: 15, fontWeight: '700', color: C.label }}>{isOwner ? 'Cash Out' : 'Transfer'}</Text>
            </Pressable>
          </View>

          {/* Quick actions — all same treatment */}
          <View style={{ flexDirection: 'row', width: '100%', justifyContent: 'space-around' }}>
            {[
              { icon: 'arrow.up',   label: 'Pay',     action: () => setSendVisible(true) },
              { icon: 'arrow.down', label: 'Request', action: () => setReqVisible(true)  },
              { icon: 'creditcard', label: 'Card',    action: goCard                     },
              { icon: 'qrcode',     label: 'Scan',    action: () => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light) },
            ].map(qa => (
              <Pressable key={qa.label} onPress={qa.action} style={{ alignItems: 'center', gap: 8 }}>
                <View style={{ width: 56, height: 56, borderRadius: 28, backgroundColor: C.separator, alignItems: 'center', justifyContent: 'center' }}>
                  <IconSymbol name={qa.icon as any} size={22} color={C.label} />
                </View>
                <Text style={{ fontSize: 12, fontWeight: '500', color: C.secondary }}>{qa.label}</Text>
              </Pressable>
            ))}
          </View>
        </View>

        {/* ── Earnings (Owner only) ── */}
        {isOwner && (
          <View style={{ marginHorizontal: 16, marginTop: 24 }}>
            <SectionHeader title="Earnings" linkLabel="See all" onLink={goEarnings} />
            <View style={{ backgroundColor: C.surface, borderRadius: 16, overflow: 'hidden' }}>
              {/* This month */}
              <View style={{ padding: 16, borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: C.separator }}>
                <Text style={{ fontSize: 13, color: C.secondary, marginBottom: 6 }}>This Month</Text>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                  <Text style={{ fontSize: 28, fontWeight: '800', color: C.label }}>$4,200</Text>
                  <View style={{ backgroundColor: `${KPGAIN}20`, borderRadius: 10, paddingHorizontal: 8, paddingVertical: 3 }}>
                    <Text style={{ fontSize: 12, fontWeight: '700', color: KPGAIN }}>+8% vs last month</Text>
                  </View>
                </View>
              </View>
              {/* Top 3 sources */}
              {TOP_SOURCES.map((src, i) => (
                <View key={src.label} style={{ flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 12, borderTopWidth: i === 0 ? 0 : StyleSheet.hairlineWidth, borderTopColor: C.separator }}>
                  <Text style={{ fontSize: 14, color: C.label, flex: 1 }}>{src.label}</Text>
                  <View style={{ width: 72, height: 4, backgroundColor: C.separator, borderRadius: 2, marginRight: 10 }}>
                    <View style={{ width: `${src.pct}%` as any, height: 4, backgroundColor: src.color, borderRadius: 2 }} />
                  </View>
                  <Text style={{ fontSize: 13, fontWeight: '700', color: C.label, width: 52, textAlign: 'right' }}>${src.amount.toLocaleString()}</Text>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* ── Recent Activity ── */}
        <View style={{ marginHorizontal: 16, marginTop: 24 }}>
          <SectionHeader title="Recent Activity" linkLabel="See all" onLink={goActivity} />
          <View style={{ backgroundColor: C.surface, borderRadius: 16, overflow: 'hidden' }}>
            {recentTxs.map((tx, i) => {
              const isIncome  = tx.type === 'income';
              const isExpense = tx.type === 'expense';
              const iconName  = isIncome  ? 'arrow.down.circle.fill'
                              : isExpense ? 'arrow.up.circle.fill'
                              : 'arrow.left.arrow.right.circle.fill';
              const iconColor = isIncome ? KPGAIN : isExpense ? KPHEAT : C.secondary;
              const amtColor  = tx.amount > 0 ? KPGAIN : isExpense ? KPHEAT : C.secondary;
              return (
                <View key={tx.id} style={{ flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 12, borderTopWidth: i === 0 ? 0 : StyleSheet.hairlineWidth, borderTopColor: C.separator, gap: 12 }}>
                  <View style={{ width: 36, height: 36, borderRadius: 18, backgroundColor: C.separator, alignItems: 'center', justifyContent: 'center' }}>
                    <IconSymbol name={iconName as any} size={18} color={iconColor} />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={{ fontSize: 14, fontWeight: '500', color: C.label }} numberOfLines={1}>{tx.description}</Text>
                    <Text style={{ fontSize: 12, color: C.secondary }}>{tx.date}</Text>
                  </View>
                  <Text style={{ fontSize: 14, fontWeight: '700', color: amtColor }}>
                    {tx.amount > 0 ? '+' : ''}${Math.abs(tx.amount).toFixed(2)}
                  </Text>
                </View>
              );
            })}
          </View>
        </View>

        {/* ── Savings ── */}
        <View style={{ marginHorizontal: 16, marginTop: 24, marginBottom: 8 }}>
          <SectionHeader title="Savings" />
          <View style={{ backgroundColor: C.surface, borderRadius: 16, overflow: 'hidden' }}>
            {/* Balance + APY */}
            <View style={{ padding: 16, borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: C.separator }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                <View>
                  <Text style={{ fontSize: 24, fontWeight: '800', color: C.label }}>$89.20</Text>
                  <Text style={{ fontSize: 13, color: C.secondary, marginTop: 2 }}>Savings balance</Text>
                </View>
                <View style={{ backgroundColor: `${KPGAIN}20`, borderRadius: 20, paddingHorizontal: 12, paddingVertical: 5 }}>
                  <Text style={{ fontSize: 12, fontWeight: '700', color: KPGAIN }}>4.15% APY</Text>
                </View>
              </View>
            </View>
            {/* Auto-save rules */}
            <View style={{ paddingHorizontal: 16, paddingVertical: 12, flexDirection: 'row', gap: 8, borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: C.separator }}>
              <View style={{ backgroundColor: `${KPGAIN}15`, borderRadius: 10, paddingHorizontal: 10, paddingVertical: 4 }}>
                <Text style={{ fontSize: 12, fontWeight: '600', color: KPGAIN }}>Round-Up: On</Text>
              </View>
              <View style={{ backgroundColor: `${KPGAIN}15`, borderRadius: 10, paddingHorizontal: 10, paddingVertical: 4 }}>
                <Text style={{ fontSize: 12, fontWeight: '600', color: KPGAIN }}>Auto-Save: $25/wk</Text>
              </View>
            </View>
            {/* Savings goal */}
            <View style={{ padding: 16, borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: C.separator }}>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 }}>
                <Text style={{ fontSize: 14, fontWeight: '600', color: C.label }}>Emergency Fund</Text>
                <Text style={{ fontSize: 13, color: C.secondary }}>$89.20 / $1,000</Text>
              </View>
              <View style={{ height: 5, backgroundColor: C.separator, borderRadius: 3 }}>
                <View style={{ width: '9%', height: 5, backgroundColor: C.label, borderRadius: 3 }} />
              </View>
              <Text style={{ fontSize: 12, color: C.secondary, marginTop: 6 }}>~34 months at current rate</Text>
            </View>
            {/* Manage link */}
            <Pressable
              onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); goSavings(); }}
              style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingVertical: 14 }}
            >
              <Text style={{ fontSize: 14, fontWeight: '600', color: C.label }}>Manage Savings</Text>
              <IconSymbol name="chevron.right" size={14} color={C.secondary} />
            </Pressable>
          </View>
        </View>

      </ScrollView>

      {/* ── Send Money sheet ── */}
      <BottomSheet visible={sendVisible} onClose={() => { setSendVisible(false); setSendAmount(''); setSendTo(''); setSendNote(''); }} useModal>
        <View style={{ padding: 20 }}>
          <Text style={{ fontSize: 18, fontWeight: '700', color: C.label, marginBottom: 16 }}>Send Money</Text>
          <Text style={{ fontSize: 13, fontWeight: '600', color: C.secondary, marginBottom: 6 }}>To</Text>
          <TextInput value={sendTo} onChangeText={setSendTo} placeholder="Name or $KPay handle" placeholderTextColor={C.secondary} style={{ backgroundColor: C.surface, borderRadius: 10, paddingHorizontal: 14, paddingVertical: 10, fontSize: 15, color: C.label, marginBottom: 14 }} />
          <Text style={{ fontSize: 13, fontWeight: '600', color: C.secondary, marginBottom: 6 }}>Amount</Text>
          <TextInput value={sendAmount} onChangeText={setSendAmount} placeholder="$0.00" placeholderTextColor={C.secondary} keyboardType="decimal-pad" style={{ backgroundColor: C.surface, borderRadius: 10, paddingHorizontal: 14, paddingVertical: 10, fontSize: 22, fontWeight: '700', color: C.label, marginBottom: 14 }} />
          <Text style={{ fontSize: 13, fontWeight: '600', color: C.secondary, marginBottom: 6 }}>Note (optional)</Text>
          <TextInput value={sendNote} onChangeText={setSendNote} placeholder="What's it for?" placeholderTextColor={C.secondary} style={{ backgroundColor: C.surface, borderRadius: 10, paddingHorizontal: 14, paddingVertical: 10, fontSize: 15, color: C.label, marginBottom: 20 }} />
          <Pressable onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium); setSendVisible(false); setSendAmount(''); setSendTo(''); setSendNote(''); }} style={{ backgroundColor: C.label, borderRadius: 12, paddingVertical: 14, alignItems: 'center' }}>
            <Text style={{ fontSize: 16, fontWeight: '700', color: C.bg }}>Send</Text>
          </Pressable>
        </View>
      </BottomSheet>

      {/* ── Add Money sheet ── */}
      <BottomSheet visible={reqVisible} onClose={() => setReqVisible(false)} useModal>
        <View style={{ padding: 20 }}>
          <Text style={{ fontSize: 18, fontWeight: '700', color: C.label, marginBottom: 16 }}>Add Money</Text>
          <Text style={{ fontSize: 13, color: C.secondary, marginBottom: 16 }}>Transfer from a linked bank account.</Text>
          {['Chase ••••1234', 'Wells Fargo ••••5678'].map((bank, i) => (
            <Pressable key={i} onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); setReqVisible(false); }} style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: C.surface, borderRadius: 12, padding: 14, marginBottom: 10 }}>
              <IconSymbol name="building.columns.fill" size={20} color={C.secondary} />
              <Text style={{ fontSize: 15, fontWeight: '600', color: C.label, marginLeft: 12, flex: 1 }}>{bank}</Text>
              <IconSymbol name="chevron.right" size={14} color={C.secondary} />
            </Pressable>
          ))}
          <Pressable onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); setReqVisible(false); }} style={{ height: 44, borderRadius: 12, borderWidth: 1, borderColor: C.separator, alignItems: 'center', justifyContent: 'center', marginTop: 4 }}>
            <Text style={{ fontSize: 14, fontWeight: '600', color: C.label }}>+ Link a bank account</Text>
          </Pressable>
        </View>
      </BottomSheet>

    </View>
  );
}

export default function KayPayScreen(){
  const C=useColors();
  const insets=useSafeAreaInsets();
  const s=useMemo(()=>makeStyles(C),[C]);
  const topBarH=insets.top+TOP_BAR_H;
  const { state } = useAppContext();
  const mode = state.activeContext?.mode ?? state.mode ?? 'business';
  const dataMode = useDataMode();

  const roleKey = KAYPAY_ROLE_KEYS[mode] ?? 'business:kaypay';
  const [role, cycleRole, roleCycles] = useDemoRole(roleKey);
  const isAdminRole = role === roleCycles[0];
  const accent = MODE_ACCENTS[mode] ?? C.accent;
  const { width: screenWidth } = useWindowDimensions();

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

  if (dataMode === 'live') return <LiveKpayView mode={mode} C={C} insets={insets} />;
  if (mode === 'personal') return <PersonalKPayView C={C} insets={insets} role={role} cycleRole={cycleRole} isOwner={isAdminRole} />;

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
  const { opacity, onScroll, scrollEventThrottle } = useScrollHeader(topBarH);

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
    const BAR_MONTHS=[
      {month:'Nov',value:420},{month:'Dec',value:680},{month:'Jan',value:390},
      {month:'Feb',value:820},{month:'Mar',value:560},{month:'Apr',value:340},
    ];
    const maxBar=Math.max(...BAR_MONTHS.map(b=>b.value));
    const BAR_MAX_H=80;
    const barW=Math.floor((screenWidth-80)/7);
    const OWNER_TXS=[
      {icon:'arrow.down.circle.fill',color:GAIN,desc:'Subscription — Inner Circle',amount:'+$25.00',date:'Apr 7'},
      {icon:'arrow.down.circle.fill',color:GAIN,desc:'Product Sale — The Blueprint',amount:'+$19.99',date:'Apr 6'},
      {icon:'arrow.up.circle.fill',color:HEAT,desc:'Chick-fil-A',amount:'-$14.23',date:'Apr 6'},
      {icon:'arrow.down.circle.fill',color:GAIN,desc:'Tip from @marcus_j',amount:'+$10.00',date:'Apr 5'},
      {icon:'arrow.up.circle.fill',color:HEAT,desc:'Shell Gas Station',amount:'-$52.40',date:'Apr 4'},
      {icon:'arrow.down.circle.fill',color:GAIN,desc:'Subscription — Supporters',amount:'+$10.00',date:'Apr 3'},
    ];
    return(
      <ScrollView showsVerticalScrollIndicator={false} onScroll={onScroll} scrollEventThrottle={scrollEventThrottle} contentContainerStyle={{paddingBottom:120,paddingTop:contentPaddingTop}}>

        {/* 1. Balance card */}
        <View style={{marginHorizontal:16,marginTop:16,borderRadius:20,backgroundColor:C.label,padding:24}}>
          <Text style={{fontSize:12,color:'rgba(255,255,255,0.65)',marginBottom:6}}>Available Balance</Text>
          <Text style={{fontSize:40,fontWeight:'800',color:'#fff',marginBottom:8}}>$2,340.50</Text>
          <Text style={{fontSize:12,color:'rgba(255,255,255,0.65)'}}>Earning 4.00% APY · +$0.26 today</Text>
        </View>

        {/* 2. Quick actions row */}
        <View style={{flexDirection:'row',justifyContent:'space-around',marginTop:20,marginHorizontal:16}}>
          {[
            {icon:'arrow.down.circle.fill',label:'Add Cash',fn:()=>Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)},
            {icon:'arrow.up.circle.fill',label:'Cash Out',fn:()=>Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)},
            {icon:'paperplane.fill',label:'Send',fn:()=>setShowSendSheet(true)},
            {icon:'qrcode',label:'Receive',fn:()=>{Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);setShowQRSheet(true);}},
          ].map(a=>(
            <Pressable key={a.label} style={{alignItems:'center',gap:6}} onPress={a.fn}>
              <View style={{width:52,height:52,borderRadius:26,backgroundColor:C.surface,alignItems:'center',justifyContent:'center'}}>
                <IconSymbol name={a.icon} size={22} color={C.label}/>
              </View>
              <Text style={{fontSize:11,color:C.secondary}}>{a.label}</Text>
            </Pressable>
          ))}
        </View>

        {/* 3. Earnings Summary */}
        <View style={{marginTop:24,paddingHorizontal:16}}>
          <View style={{flexDirection:'row',justifyContent:'space-between',alignItems:'center',marginBottom:10}}>
            <Text style={{fontSize:16,fontWeight:'700',color:C.label}}>Earnings</Text>
            <Text style={{fontSize:13,color:C.secondary}}>This month</Text>
          </View>
          <View style={{backgroundColor:C.surface,borderRadius:12,padding:16}}>
            <View style={{flexDirection:'row'}}>
              {[
                {label:'Subscriptions',value:'$550'},
                {label:'Tips',value:'$47'},
                {label:'Products',value:'$340'},
              ].map((item,i,arr)=>(
                <View key={item.label} style={{flex:1,alignItems:'center',borderRightWidth:i<arr.length-1?StyleSheet.hairlineWidth:0,borderColor:C.separator}}>
                  <Text style={{fontSize:18,fontWeight:'800',color:GAIN}}>{item.value}</Text>
                  <Text style={{fontSize:11,color:C.secondary,marginTop:3}}>{item.label}</Text>
                </View>
              ))}
            </View>
            <View style={{marginTop:12,paddingTop:12,borderTopWidth:StyleSheet.hairlineWidth,borderTopColor:C.separator,flexDirection:'row',justifyContent:'space-between',alignItems:'center'}}>
              <Text style={{fontSize:13,color:C.secondary}}>Total Earned</Text>
              <Text style={{fontSize:16,fontWeight:'700',color:C.label}}>$937</Text>
            </View>
          </View>
        </View>

        {/* 4. KaNeXT Card */}
        <View style={{marginTop:24,paddingHorizontal:16}}>
          <Text style={{fontSize:16,fontWeight:'700',color:C.label,marginBottom:12}}>KaNeXT Card</Text>
          {/* Card visual */}
          <View style={{width:'100%',height:180,borderRadius:16,backgroundColor:C.label,padding:20,justifyContent:'space-between'}}>
            <View style={{flexDirection:'row',justifyContent:'space-between',alignItems:'flex-start'}}>
              <Text style={{fontSize:12,fontWeight:'700',color:'rgba(255,255,255,0.7)'}}>KANEXT</Text>
              <View style={{backgroundColor:GAIN,paddingHorizontal:10,paddingVertical:4,borderRadius:8}}>
                <Text style={{fontSize:11,fontWeight:'700',color:'#fff'}}>ACTIVE</Text>
              </View>
            </View>
            <View style={{alignItems:'center'}}>
              <Text style={{fontSize:18,fontWeight:'700',color:'#fff',letterSpacing:2}}>{'•••• •••• •••• 4521'}</Text>
            </View>
            <View style={{flexDirection:'row',justifyContent:'space-between',alignItems:'flex-end'}}>
              <Text style={{fontSize:12,color:'#fff',fontWeight:'600'}}>SAMMY KALEJAIYE</Text>
              <Text style={{fontSize:12,color:'rgba(255,255,255,0.8)'}}>04/28</Text>
            </View>
          </View>
          {/* Card action buttons */}
          <View style={{flexDirection:'row',justifyContent:'space-around',marginTop:14}}>
            {[
              {icon:'snowflake',label:'Freeze'},
              {icon:'eye.slash',label:'Number'},
              {icon:'applelogo',label:'Apple Pay'},
              {icon:'creditcard.fill',label:'Order'},
            ].map(a=>(
              <Pressable key={a.label} style={{alignItems:'center',gap:6}}
                onPress={()=>{Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);if(a.label==='Number')setShowCardSheet(true);}}>
                <View style={{width:52,height:52,borderRadius:26,backgroundColor:C.surface,alignItems:'center',justifyContent:'center'}}>
                  <IconSymbol name={a.icon} size={22} color={C.label}/>
                </View>
                <Text style={{fontSize:11,color:C.secondary}}>{a.label}</Text>
              </Pressable>
            ))}
          </View>
          {/* Boosts */}
          <Text style={{fontSize:14,fontWeight:'700',color:C.label,marginTop:16,marginBottom:8}}>Boosts</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{gap:8}}>
            {[
              {merchant:'Chick-fil-A',pct:'10%'},
              {merchant:'Shell',pct:'5%'},
              {merchant:'Amazon',pct:'3%'},
              {merchant:'Target',pct:'2%'},
            ].map(b=>(
              <View key={b.merchant} style={{backgroundColor:C.surface,borderRadius:10,paddingHorizontal:12,paddingVertical:8}}>
                <Text style={{fontSize:13,fontWeight:'700',color:GAIN}}>{b.pct+' back'}</Text>
                <Text style={{fontSize:12,color:C.secondary}}>{b.merchant}</Text>
              </View>
            ))}
          </ScrollView>
        </View>

        {/* 5. Recent Transactions */}
        <View style={{marginTop:24,paddingHorizontal:16}}>
          <Text style={{fontSize:16,fontWeight:'700',color:C.label,marginBottom:12}}>Recent Transactions</Text>
          <View style={{backgroundColor:C.surface,borderRadius:12,overflow:'hidden'}}>
            {OWNER_TXS.map((tx,i)=>(
              <View key={i}>
                <View style={{flexDirection:'row',alignItems:'center',paddingVertical:12,paddingHorizontal:14,gap:12}}>
                  <View style={{width:36,height:36,borderRadius:18,backgroundColor:tx.color+'22',alignItems:'center',justifyContent:'center'}}>
                    <IconSymbol name={tx.icon} size={18} color={tx.color}/>
                  </View>
                  <Text style={{flex:1,fontSize:13,color:C.label}} numberOfLines={1}>{tx.desc}</Text>
                  <View style={{alignItems:'flex-end'}}>
                    <Text style={{fontSize:13,fontWeight:'700',color:tx.color}}>{tx.amount}</Text>
                    <Text style={{fontSize:11,color:C.secondary}}>{tx.date}</Text>
                  </View>
                </View>
                {i<OWNER_TXS.length-1&&<View style={{height:StyleSheet.hairlineWidth,backgroundColor:C.separator,marginLeft:62}}/>}
              </View>
            ))}
          </View>
          <Pressable onPress={()=>Haptics.selectionAsync()} style={{alignItems:'center',paddingVertical:12}}>
            <Text style={{fontSize:13,fontWeight:'700',color:C.label}}>View All</Text>
          </Pressable>
        </View>

        {/* 6. Revenue Trend */}
        <View style={{marginTop:24,paddingHorizontal:16,paddingBottom:120}}>
          <View style={{flexDirection:'row',justifyContent:'space-between',alignItems:'center',marginBottom:14}}>
            <Text style={{fontSize:16,fontWeight:'700',color:C.label}}>Revenue Trend</Text>
            <Text style={{fontSize:13,color:C.secondary}}>Last 6 months</Text>
          </View>
          <View style={{flexDirection:'row',alignItems:'flex-end',justifyContent:'space-between',height:BAR_MAX_H+24}}>
            {BAR_MONTHS.map(b=>{
              const barH=Math.round((b.value/maxBar)*BAR_MAX_H);
              return(
                <View key={b.month} style={{alignItems:'center',gap:4}}>
                  <View style={{width:barW,height:barH,backgroundColor:C.label,borderRadius:4}}/>
                  <Text style={{fontSize:10,color:C.secondary}}>{b.month}</Text>
                </View>
              );
            })}
          </View>
          <Text style={{fontSize:12,color:C.secondary,textAlign:'right',marginTop:8}}>Total: $3,210</Text>
        </View>

      </ScrollView>
    );
  }

  function renderWalletInstitutional(){
    return(
      <ScrollView showsVerticalScrollIndicator={false} onScroll={onScroll} scrollEventThrottle={scrollEventThrottle} contentContainerStyle={{padding:16,paddingBottom:120,paddingTop:contentPaddingTop}}>
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
            <Text style={{fontSize:11,color:C.secondary}}>processed this month</Text>
            <View style={[s.row,{gap:6,marginTop:8}]}>
              <View style={s.infoBadge}><Text style={{fontSize:11,fontWeight:"700",color:C.accent}}>5% card</Text></View>
              <View style={s.infoBadge}><Text style={{fontSize:11,fontWeight:"700",color:C.accent}}>3% wallet</Text></View>
            </View>
          </GlassView>
          <GlassView tier={1} style={{flex:1,padding:14,borderRadius:16}}>
            <Text style={{fontSize:11,fontWeight:"600",color:C.secondary}}>Payroll</Text>
            <Text style={{fontSize:22,fontWeight:"800",color:C.label,marginTop:4}}>{formatCompact(INSTITUTIONAL_WALLET.payrollNext.amount)}</Text>
            <Text style={{fontSize:11,color:C.secondary}}>{"Next: "+INSTITUTIONAL_WALLET.payrollNext.date}</Text>
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
                        <Text style={{fontSize:12,color:C.secondary}}>{sp.pct+"%"}</Text>
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

  function renderSubscriberWalletView(){
    const SUB_TXS=[
      {icon:'arrow.up.circle.fill',color:HEAT,desc:'Inner Circle — Sammy K',amount:'-$25.00',date:'Apr 1'},
      {icon:'arrow.down.circle.fill',color:GAIN,desc:'Received from @dad',amount:'+$200.00',date:'Mar 30'},
      {icon:'arrow.up.circle.fill',color:HEAT,desc:'Amazon Purchase',amount:'-$43.99',date:'Mar 28'},
      {icon:'arrow.up.circle.fill',color:HEAT,desc:'Shell Gas Station',amount:'-$48.20',date:'Mar 25'},
      {icon:'arrow.down.circle.fill',color:GAIN,desc:'Cash Out to Chase',amount:'+$300.00',date:'Mar 20'},
    ];
    const PURCHASES=[
      {desc:'Inner Circle Subscription',amount:'$25.00/mo',date:'Apr 1',status:'Active'},
      {desc:'The Blueprint (eBook)',amount:'$19.99',date:'Mar 15',status:'Completed'},
      {desc:'Tip sent',amount:'$10.00',date:'Mar 10',status:'Completed'},
      {desc:'Film Study Masterclass',amount:'$89.00',date:'Feb 28',status:'Completed'},
    ];
    return(
      <ScrollView showsVerticalScrollIndicator={false} onScroll={onScroll} scrollEventThrottle={scrollEventThrottle} contentContainerStyle={{paddingBottom:120,paddingTop:contentPaddingTop}}>

        {/* 1. Balance card */}
        <View style={{marginHorizontal:16,marginTop:16,borderRadius:20,backgroundColor:C.label,padding:24}}>
          <Text style={{fontSize:12,color:'rgba(255,255,255,0.65)',marginBottom:6}}>Available Balance</Text>
          <Text style={{fontSize:40,fontWeight:'800',color:'#fff',marginBottom:8}}>$487.23</Text>
          <Text style={{fontSize:12,color:'rgba(255,255,255,0.65)'}}>Earning 4.00% APY · +$0.13 today</Text>
        </View>

        {/* 2. Quick actions row */}
        <View style={{flexDirection:'row',justifyContent:'space-around',marginTop:20,marginHorizontal:16}}>
          {[
            {icon:'arrow.down.circle.fill',label:'Add Cash',fn:()=>Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)},
            {icon:'arrow.up.circle.fill',label:'Cash Out',fn:()=>Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)},
            {icon:'paperplane.fill',label:'Send',fn:()=>setShowSendSheet(true)},
            {icon:'qrcode',label:'Receive',fn:()=>{Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);setShowQRSheet(true);}},
          ].map(a=>(
            <Pressable key={a.label} style={{alignItems:'center',gap:6}} onPress={a.fn}>
              <View style={{width:52,height:52,borderRadius:26,backgroundColor:C.surface,alignItems:'center',justifyContent:'center'}}>
                <IconSymbol name={a.icon} size={22} color={C.label}/>
              </View>
              <Text style={{fontSize:11,color:C.secondary}}>{a.label}</Text>
            </Pressable>
          ))}
        </View>

        {/* 3. Purchases from Creator */}
        <View style={{marginTop:24,paddingHorizontal:16}}>
          <Text style={{fontSize:16,fontWeight:'700',color:C.label,marginBottom:2}}>From Sammy Kalejaiye</Text>
          <Text style={{fontSize:13,color:C.secondary,marginBottom:12}}>Your purchases from this creator</Text>
          <View style={{backgroundColor:C.surface,borderRadius:12,overflow:'hidden'}}>
            {PURCHASES.map((p,i)=>(
              <View key={i}>
                <View style={{flexDirection:'row',alignItems:'center',paddingVertical:12,paddingHorizontal:14}}>
                  <View style={{flex:1}}>
                    <Text style={{fontSize:13,fontWeight:'600',color:C.label}}>{p.desc}</Text>
                    <Text style={{fontSize:11,color:C.secondary,marginTop:2}}>{p.date}</Text>
                  </View>
                  <View style={{alignItems:'flex-end',gap:4}}>
                    <Text style={{fontSize:13,fontWeight:'700',color:C.label}}>{p.amount}</Text>
                    <View style={{backgroundColor:p.status==='Active'?GAIN+'22':C.separator,paddingHorizontal:8,paddingVertical:2,borderRadius:6}}>
                      <Text style={{fontSize:11,fontWeight:'600',color:p.status==='Active'?GAIN:C.secondary}}>{p.status}</Text>
                    </View>
                  </View>
                </View>
                {i<PURCHASES.length-1&&<View style={{height:StyleSheet.hairlineWidth,backgroundColor:C.separator,marginLeft:14}}/>}
              </View>
            ))}
          </View>
          <Text style={{fontSize:12,color:C.secondary,textAlign:'right',marginTop:8}}>Total Spent: $143.99</Text>
        </View>

        {/* 4. KaNeXT Card */}
        <View style={{marginTop:24,paddingHorizontal:16}}>
          <Text style={{fontSize:16,fontWeight:'700',color:C.label,marginBottom:12}}>KaNeXT Card</Text>
          {/* Card visual */}
          <View style={{width:'100%',height:180,borderRadius:16,backgroundColor:C.label,padding:20,justifyContent:'space-between'}}>
            <View style={{flexDirection:'row',justifyContent:'space-between',alignItems:'flex-start'}}>
              <Text style={{fontSize:12,fontWeight:'700',color:'rgba(255,255,255,0.7)'}}>KANEXT</Text>
              <View style={{backgroundColor:GAIN,paddingHorizontal:10,paddingVertical:4,borderRadius:8}}>
                <Text style={{fontSize:11,fontWeight:'700',color:'#fff'}}>ACTIVE</Text>
              </View>
            </View>
            <View style={{alignItems:'center'}}>
              <Text style={{fontSize:18,fontWeight:'700',color:'#fff',letterSpacing:2}}>{'•••• •••• •••• 7291'}</Text>
            </View>
            <View style={{flexDirection:'row',justifyContent:'space-between',alignItems:'flex-end'}}>
              <Text style={{fontSize:12,color:'#fff',fontWeight:'600'}}>ALEX MARTIN</Text>
              <Text style={{fontSize:12,color:'rgba(255,255,255,0.8)'}}>04/28</Text>
            </View>
          </View>
          {/* Card action buttons */}
          <View style={{flexDirection:'row',justifyContent:'space-around',marginTop:14}}>
            {[
              {icon:'snowflake',label:'Freeze'},
              {icon:'eye.slash',label:'Number'},
              {icon:'applelogo',label:'Apple Pay'},
              {icon:'creditcard.fill',label:'Order'},
            ].map(a=>(
              <Pressable key={a.label} style={{alignItems:'center',gap:6}}
                onPress={()=>{Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);if(a.label==='Number')setShowCardSheet(true);}}>
                <View style={{width:52,height:52,borderRadius:26,backgroundColor:C.surface,alignItems:'center',justifyContent:'center'}}>
                  <IconSymbol name={a.icon} size={22} color={C.label}/>
                </View>
                <Text style={{fontSize:11,color:C.secondary}}>{a.label}</Text>
              </Pressable>
            ))}
          </View>
          {/* Boosts */}
          <Text style={{fontSize:14,fontWeight:'700',color:C.label,marginTop:16,marginBottom:8}}>Boosts</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{gap:8}}>
            {[
              {merchant:'Chick-fil-A',pct:'10%'},
              {merchant:'Shell',pct:'5%'},
              {merchant:'Amazon',pct:'3%'},
              {merchant:'Target',pct:'2%'},
            ].map(b=>(
              <View key={b.merchant} style={{backgroundColor:C.surface,borderRadius:10,paddingHorizontal:12,paddingVertical:8}}>
                <Text style={{fontSize:13,fontWeight:'700',color:GAIN}}>{b.pct+' back'}</Text>
                <Text style={{fontSize:12,color:C.secondary}}>{b.merchant}</Text>
              </View>
            ))}
          </ScrollView>
        </View>

        {/* 5. Recent Transactions */}
        <View style={{marginTop:24,paddingHorizontal:16,paddingBottom:120}}>
          <Text style={{fontSize:16,fontWeight:'700',color:C.label,marginBottom:12}}>Recent Transactions</Text>
          <View style={{backgroundColor:C.surface,borderRadius:12,overflow:'hidden'}}>
            {SUB_TXS.map((tx,i)=>(
              <View key={i}>
                <View style={{flexDirection:'row',alignItems:'center',paddingVertical:12,paddingHorizontal:14,gap:12}}>
                  <View style={{width:36,height:36,borderRadius:18,backgroundColor:tx.color+'22',alignItems:'center',justifyContent:'center'}}>
                    <IconSymbol name={tx.icon} size={18} color={tx.color}/>
                  </View>
                  <Text style={{flex:1,fontSize:13,color:C.label}} numberOfLines={1}>{tx.desc}</Text>
                  <View style={{alignItems:'flex-end'}}>
                    <Text style={{fontSize:13,fontWeight:'700',color:tx.color}}>{tx.amount}</Text>
                    <Text style={{fontSize:11,color:C.secondary}}>{tx.date}</Text>
                  </View>
                </View>
                {i<SUB_TXS.length-1&&<View style={{height:StyleSheet.hairlineWidth,backgroundColor:C.separator,marginLeft:62}}/>}
              </View>
            ))}
          </View>
          <Pressable onPress={()=>Haptics.selectionAsync()} style={{alignItems:'center',paddingVertical:12}}>
            <Text style={{fontSize:13,fontWeight:'700',color:C.label}}>View All</Text>
          </Pressable>
        </View>

      </ScrollView>
    );
  }

  function renderEducationStudentWallet(){
    const EDU_TXS=[
      {name:"Bookstore — BUS 401 Textbook",   date:"Mar 30, 2026",amount:"-$87.00", positive:false},
      {name:"Bookstore — MBA 520 Course Pack", date:"Mar 28, 2026",amount:"-$34.00", positive:false},
      {name:"Campus Printing",                 date:"Mar 26, 2026",amount:"-$4.50",  positive:false},
      {name:"Financial Aid Disbursement",      date:"Mar 15, 2026",amount:"+$1,500.00",positive:true},
      {name:"Campus Café",                     date:"Mar 14, 2026",amount:"-$12.75", positive:false},
    ];
    return(
      <ScrollView showsVerticalScrollIndicator={false} onScroll={onScroll} scrollEventThrottle={scrollEventThrottle} contentContainerStyle={{paddingBottom:120,paddingTop:contentPaddingTop}}>
        {/* Balance card */}
        <View style={{marginHorizontal:16,marginVertical:16,borderRadius:20,backgroundColor:C.label,padding:24}}>
          <Text style={{fontSize:12,color:"rgba(255,255,255,0.7)",marginBottom:8}}>KPay Balance</Text>
          <Text style={{fontSize:36,fontWeight:"700",color:"#fff",marginBottom:4}}>$847.50</Text>
          <Text style={{fontSize:13,color:"rgba(255,255,255,0.55)",marginBottom:20}}>Lincoln University Student Account</Text>
          <View style={{flexDirection:"row",gap:10}}>
            <Pressable
              style={{flex:1,height:44,borderRadius:12,borderWidth:1.5,borderColor:"rgba(255,255,255,0.7)",alignItems:"center",justifyContent:"center"}}
              onPress={()=>Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)}
            >
              <Text style={{fontSize:15,fontWeight:"700",color:"#fff"}}>Send</Text>
            </Pressable>
            <Pressable
              style={{flex:1,height:44,borderRadius:12,borderWidth:1.5,borderColor:"rgba(255,255,255,0.7)",alignItems:"center",justifyContent:"center"}}
              onPress={()=>Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)}
            >
              <Text style={{fontSize:15,fontWeight:"700",color:"#fff"}}>QR Code</Text>
            </Pressable>
          </View>
        </View>

        {/* Pay Tuition banner */}
        <View style={{marginHorizontal:16,marginBottom:12,borderRadius:16,backgroundColor:C.surface,padding:16,borderLeftWidth:3,borderLeftColor:C.label}}>
          <Text style={{fontSize:13,fontWeight:"700",color:C.secondary,marginBottom:2}}>OUTSTANDING BALANCE</Text>
          <Text style={{fontSize:24,fontWeight:"800",color:C.label,marginBottom:6}}>$3,287.50</Text>
          <Text style={{fontSize:12,color:C.secondary,marginBottom:12}}>Spring 2026 Tuition — due May 1, 2026</Text>
          <Pressable
            style={({pressed})=>({backgroundColor:C.label,borderRadius:10,paddingVertical:10,paddingHorizontal:20,alignSelf:"flex-start",opacity:pressed?0.8:1})}
            onPress={()=>Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium)}
          >
            <Text style={{fontSize:14,fontWeight:"700",color:C.bg}}>Pay Tuition</Text>
          </Pressable>
        </View>

        {/* Financial Aid notice */}
        <View style={{marginHorizontal:16,marginBottom:12,borderRadius:14,backgroundColor:C.surface,padding:14,flexDirection:"row",alignItems:"center",gap:12}}>
          <View style={{width:36,height:36,borderRadius:18,backgroundColor:C.label+"22",alignItems:"center",justifyContent:"center"}}>
            <IconSymbol name="dollarsign.circle.fill" size={18} color={C.green}/>
          </View>
          <View style={{flex:1}}>
            <Text style={{fontSize:13,fontWeight:"700",color:C.label}}>Financial Aid Disbursed</Text>
            <Text style={{fontSize:12,color:C.secondary,marginTop:1}}>$1,500.00 applied — Mar 15, 2026</Text>
          </View>
          <View style={{backgroundColor:C.green+"22",paddingHorizontal:8,paddingVertical:4,borderRadius:8}}>
            <Text style={{fontSize:11,fontWeight:"700",color:C.green}}>Applied</Text>
          </View>
        </View>

        {/* Transactions */}
        <Text style={{fontSize:11,fontWeight:"700",color:C.secondary,letterSpacing:1,paddingHorizontal:16,paddingVertical:8,textTransform:"uppercase"}}>Recent Transactions</Text>
        {EDU_TXS.map((tx,i)=>(
          <View key={i} style={{flexDirection:"row",alignItems:"center",justifyContent:"space-between",paddingVertical:12,paddingHorizontal:16,borderBottomWidth:StyleSheet.hairlineWidth,borderBottomColor:C.separator}}>
            <View style={{flex:1}}>
              <Text style={{fontSize:14,fontWeight:"600",color:C.label}}>{tx.name}</Text>
              <Text style={{fontSize:12,color:C.secondary,marginTop:2}}>{tx.date}</Text>
            </View>
            <Text style={{fontSize:14,fontWeight:"700",color:tx.positive?C.green:C.red}}>{tx.amount}</Text>
          </View>
        ))}
      </ScrollView>
    );
  }

  function renderEducationPresidentFinance(){
    const FUNDS=[
      {id:"f1",name:"Operating",      balance:842500,  inflow:210000, outflow:187000},
      {id:"f2",name:"Tuition Revenue",balance:1240000, inflow:387000, outflow:0},
      {id:"f3",name:"Payroll Reserve",balance:620000,  inflow:0,      outflow:198000},
      {id:"f4",name:"Capital Projects",balance:325000, inflow:50000,  outflow:22000},
    ];
    const PAYROLL=[
      {name:"Faculty — Full-Time (18)",    amount:148200,date:"Apr 15"},
      {name:"Staff — Administrative (12)", amount:38400, date:"Apr 15"},
      {name:"Adjunct Faculty (11)",        amount:11600, date:"Apr 30"},
    ];
    const TUITION=[
      {status:"Paid",    count:284, pct:0.65},
      {status:"Partial", count:97,  pct:0.22},
      {status:"Unpaid",  count:55,  pct:0.13},
    ];
    const statusColor=(s:string)=>s==="Paid"?C.green:s==="Partial"?C.amber:C.red;
    return(
      <ScrollView showsVerticalScrollIndicator={false} onScroll={onScroll} scrollEventThrottle={scrollEventThrottle} contentContainerStyle={{padding:16,paddingBottom:120,paddingTop:contentPaddingTop}}>
        {/* Hero */}
        <GlassView tier={1} style={[s.balanceHero,{backgroundColor:NAVY}]}>
          <Text style={{fontSize:12,color:"rgba(255,255,255,0.55)",fontWeight:"600",textAlign:"center",letterSpacing:0.5}}>LINCOLN UNIVERSITY</Text>
          <Text style={s.balanceAmt}>{formatCompact(3027500)}</Text>
          <Text style={{fontSize:13,color:"rgba(255,255,255,0.50)",textAlign:"center",marginTop:2}}>Total Institutional Funds</Text>
        </GlassView>

        {/* Fund Accounts */}
        <Text style={[s.sectionHeader,{marginBottom:10}]}>Fund Accounts</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{gap:10,paddingBottom:12}}>
          {FUNDS.map(fa=>(
            <GlassView key={fa.id} tier={1} style={{width:140,padding:14,borderRadius:16,gap:6}}>
              <Text style={{fontSize:12,fontWeight:"700",color:C.secondary}}>{fa.name}</Text>
              <Text style={{fontSize:20,fontWeight:"800",color:C.label}}>{formatCompact(fa.balance)}</Text>
              <View style={{gap:3}}>
                {fa.inflow>0&&(<View style={[s.row,{gap:4}]}><IconSymbol name="arrow.up.circle.fill" size={12} color={C.green}/><Text style={{fontSize:11,color:C.green,fontWeight:"600"}}>{formatCompact(fa.inflow)}</Text></View>)}
                {fa.outflow>0&&(<View style={[s.row,{gap:4}]}><IconSymbol name="arrow.down.circle.fill" size={12} color={C.red}/><Text style={{fontSize:11,color:C.red,fontWeight:"600"}}>{formatCompact(fa.outflow)}</Text></View>)}
              </View>
            </GlassView>
          ))}
        </ScrollView>

        {/* Tuition Collection */}
        <Text style={[s.sectionHeader,{marginBottom:10,marginTop:4}]}>Tuition Collection — Spring 2026</Text>
        <GlassView tier={1} style={s.card}>
          <Text style={{fontSize:12,color:C.secondary,marginBottom:10}}>436 enrolled students</Text>
          {TUITION.map(t=>(
            <View key={t.status} style={[s.row,{justifyContent:"space-between",marginBottom:8}]}>
              <View style={[s.row,{gap:8}]}>
                <View style={{width:10,height:10,borderRadius:5,backgroundColor:statusColor(t.status)}}/>
                <Text style={{fontSize:13,fontWeight:"600",color:C.label}}>{t.status}</Text>
              </View>
              <View style={[s.row,{gap:12}]}>
                <Text style={{fontSize:13,color:C.secondary}}>{t.count} students</Text>
                <Text style={{fontSize:13,fontWeight:"700",color:statusColor(t.status)}}>{Math.round(t.pct*100)}%</Text>
              </View>
            </View>
          ))}
          {/* Progress bar */}
          <View style={{height:8,borderRadius:4,backgroundColor:C.separator,marginTop:4,overflow:"hidden",flexDirection:"row"}}>
            <View style={{width:"65%",height:8,backgroundColor:C.green}}/>
            <View style={{width:"22%",height:8,backgroundColor:C.amber}}/>
            <View style={{width:"13%",height:8,backgroundColor:C.red}}/>
          </View>
        </GlassView>

        {/* Payroll */}
        <Text style={[s.sectionHeader,{marginBottom:10,marginTop:4}]}>Payroll — April 2026</Text>
        <GlassView tier={1} style={s.card}>
          {PAYROLL.map((p,i)=>(
            <View key={i} style={[s.row,{justifyContent:"space-between",paddingVertical:8,borderBottomWidth:i<PAYROLL.length-1?StyleSheet.hairlineWidth:0,borderBottomColor:C.separator}]}>
              <View style={{flex:1}}>
                <Text style={{fontSize:13,fontWeight:"600",color:C.label}}>{p.name}</Text>
                <Text style={{fontSize:11,color:C.secondary,marginTop:2}}>Next: {p.date}</Text>
              </View>
              <Text style={{fontSize:14,fontWeight:"700",color:C.label}}>{formatCompact(p.amount)}</Text>
            </View>
          ))}
          <View style={[s.row,{justifyContent:"space-between",marginTop:10,paddingTop:8,borderTopWidth:StyleSheet.hairlineWidth,borderTopColor:C.separator}]}>
            <Text style={{fontSize:13,fontWeight:"700",color:C.label}}>Total Payroll</Text>
            <Text style={{fontSize:15,fontWeight:"800",color:C.label}}>{formatCompact(198200)}</Text>
          </View>
        </GlassView>
      </ScrollView>
    );
  }

  function renderCommunityMemberWallet(){
    const MY_TX=[
      {id:"ct1",name:"ICCLA — Tithes",     amount:-150,  date:"Apr 1, 2026",  icon:"heart.fill"},
      {id:"ct2",name:"ICCLA — Building Fund",amount:-50, date:"Mar 30, 2026", icon:"building.2.fill"},
      {id:"ct3",name:"Salary Deposit",      amount:3200,  date:"Mar 28, 2026", icon:"arrow.down.circle.fill"},
      {id:"ct4",name:"ICCLA — Missions",    amount:-25,   date:"Mar 15, 2026", icon:"globe"},
      {id:"ct5",name:"ICCLA — Tithes",      amount:-150,  date:"Mar 1, 2026",  icon:"heart.fill"},
    ];
    return(
      <ScrollView showsVerticalScrollIndicator={false} onScroll={onScroll} scrollEventThrottle={scrollEventThrottle} contentContainerStyle={{padding:16,paddingBottom:120,paddingTop:contentPaddingTop}}>
        {/* Balance */}
        <GlassView tier={1} style={[s.balanceHero,{backgroundColor:NAVY}]}>
          <Text style={{fontSize:12,color:"rgba(255,255,255,0.55)",fontWeight:"600",textAlign:"center",letterSpacing:0.5}}>MY WALLET</Text>
          <Text style={s.balanceAmt}>{formatCurrency(BALANCE)}</Text>
          <Text style={{fontSize:13,color:"rgba(255,255,255,0.50)",textAlign:"center",marginTop:2}}>Available Balance</Text>
        </GlassView>
        {/* Actions */}
        <View style={[s.row,{gap:10,marginBottom:20}]}>
          <Pressable style={{flex:1}} onPress={()=>Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium)}>
            <View style={[s.giveBtn,{backgroundColor:C.accent,marginTop:0}]}>
              <Text style={s.giveBtnText}>Send</Text>
            </View>
          </Pressable>
          <Pressable style={{flex:1}} onPress={()=>Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)}>
            <View style={[s.outlineBtn,{borderColor:NAVY,height:52,borderRadius:26}]}>
              <Text style={[s.outlineBtnText,{color:NAVY,fontSize:16,fontWeight:"800"}]}>Request</Text>
            </View>
          </Pressable>
        </View>
        {/* Giving receipts */}
        <Text style={[s.sectionHeader,{marginBottom:10}]}>Transactions</Text>
        {MY_TX.map((tx,i)=>(
          <View key={tx.id} style={[s.row,{justifyContent:"space-between",paddingVertical:12,borderBottomWidth:i<MY_TX.length-1?StyleSheet.hairlineWidth:0,borderBottomColor:C.separator}]}>
            <View style={[s.row,{gap:10}]}>
              <View style={{width:40,height:40,borderRadius:20,backgroundColor:C.surface,alignItems:"center",justifyContent:"center"}}>
                <IconSymbol name={tx.icon as any} size={18} color={tx.amount<0?C.label:C.green}/>
              </View>
              <View>
                <Text style={{fontSize:14,fontWeight:"600",color:C.label}}>{tx.name}</Text>
                <Text style={{fontSize:12,color:C.secondary}}>{tx.date}</Text>
              </View>
            </View>
            <Text style={{fontSize:15,fontWeight:"700",color:tx.amount<0?C.label:C.green}}>{tx.amount<0?"-":"+"}${Math.abs(tx.amount)}</Text>
          </View>
        ))}
      </ScrollView>
    );
  }

  function RenderCommunityPastorFinance(){
    type FinanceTab='Overview'|'Funds'|'Payroll'|'Vendors'|'Budget'|'Reports';
    const [finTab,setFinTab]=React.useState<FinanceTab>('Overview');
    const [finDropOpen,setFinDrop]=React.useState(false);
    const FIN_TABS:FinanceTab[]=['Overview','Funds','Payroll','Vendors','Budget','Reports'];
    const FUNDS=[
      {id:"f1",name:"Tithes & Offerings",  balance:184200, inflow:47200, outflow:32800, restricted:false},
      {id:"f2",name:"Building Fund",        balance:218500, inflow:12400, outflow:0,     restricted:true},
      {id:"f3",name:"Missions",             balance:34700,  inflow:5800,  outflow:3200,  restricted:true},
      {id:"f4",name:"Benevolence",          balance:12300,  inflow:3100,  outflow:2800,  restricted:true},
      {id:"f5",name:"Youth Ministry",       balance:8900,   inflow:2400,  outflow:1900,  restricted:false},
    ];
    const PAYROLL=[
      {name:"Dr. Oladipo Kalejaiye",  role:"Senior Pastor",    amount:6800, date:"Apr 15"},
      {name:"Dr. Nonyelum Kalejaiye", role:"Pastor",            amount:5200, date:"Apr 15"},
      {name:"Worship Director",       role:"Full-Time Staff",   amount:3400, date:"Apr 15"},
      {name:"Admin Staff (3)",        role:"Part-Time",         amount:5100, date:"Apr 15"},
    ];
    const VENDORS=[
      {name:"SoCal Edison",         category:"Utilities",    lastPaid:"Mar 31",amount:1840},
      {name:"Sound & Light Co.",    category:"AV Equipment", lastPaid:"Mar 15",amount:620},
      {name:"Facility Maintenance", category:"Maintenance",  lastPaid:"Mar 20",amount:450},
      {name:"Catering — Events",    category:"Catering",     lastPaid:"Mar 28",amount:380},
    ];
    const BUDGET=[
      {name:"Worship Ministry",  budgeted:18000,actual:16200},
      {name:"Youth Ministry",    budgeted:12000,actual:11400},
      {name:"Outreach & Missions",budgeted:9600,actual:8100},
      {name:"Admin & Operations", budgeted:14400,actual:15800},
      {name:"Facilities",         budgeted:22000,actual:21100},
    ];
    const RECENT_TX=[
      {id:"rt1",desc:"Payroll — Apr 1",     amount:-20500,date:"Apr 1"},
      {id:"rt2",desc:"Tithes & Offerings",  amount:47200, date:"Mar 30"},
      {id:"rt3",desc:"Building Fund Giving",amount:12400, date:"Mar 30"},
      {id:"rt4",desc:"SoCal Edison",        amount:-1840, date:"Mar 31"},
      {id:"rt5",desc:"Sound & Light Co.",   amount:-620,  date:"Mar 15"},
    ];
    const totalFunds=FUNDS.reduce((a,f)=>a+f.balance,0);
    return(
      <ScrollView showsVerticalScrollIndicator={false} onScroll={onScroll} scrollEventThrottle={scrollEventThrottle} contentContainerStyle={{paddingBottom:120,paddingTop:contentPaddingTop}}>
        {/* Finance sub-tab bar */}
        <View style={{paddingHorizontal:16,paddingVertical:8}}>
          <Pressable
            onPress={()=>setFinDrop(v=>!v)}
            style={{flexDirection:"row",alignItems:"center",gap:6,paddingHorizontal:14,paddingVertical:8,borderRadius:20,backgroundColor:C.surfacePressed,alignSelf:"center"}}
          >
            <Text style={{fontSize:15,fontWeight:"700",color:C.label}}>{finTab}</Text>
            <IconSymbol name={finDropOpen?"chevron.up":"chevron.down"} size={12} color={C.secondary}/>
          </Pressable>
        </View>
        {finDropOpen&&(
          <View style={{position:"absolute",top:contentPaddingTop+48,left:"25%",right:"25%",backgroundColor:C.surface,borderRadius:14,zIndex:200,shadowColor:"#000",shadowOpacity:0.12,shadowRadius:12,shadowOffset:{width:0,height:4},elevation:8,overflow:"hidden"}}>
            {FIN_TABS.map((tab,i)=>(
              <Pressable key={tab} onPress={()=>{Haptics.selectionAsync();setFinTab(tab);setFinDrop(false);}} style={{paddingVertical:13,paddingHorizontal:18,borderBottomWidth:i<FIN_TABS.length-1?StyleSheet.hairlineWidth:0,borderBottomColor:C.separator}}>
                <Text style={{fontSize:15,color:tab===finTab?C.label:C.secondary,fontWeight:tab===finTab?"600":"400"}}>{tab}</Text>
              </Pressable>
            ))}
          </View>
        )}

        <View style={{paddingHorizontal:16}}>
          {finTab==='Overview'&&(
            <>
              {/* Church balance hero */}
              <GlassView tier={1} style={[s.balanceHero,{backgroundColor:NAVY}]}>
                <Text style={{fontSize:12,color:"rgba(255,255,255,0.55)",fontWeight:"600",textAlign:"center",letterSpacing:0.5}}>ICCLA — OPERATING</Text>
                <Text style={s.balanceAmt}>{formatCompact(totalFunds)}</Text>
                <Text style={{fontSize:13,color:"rgba(255,255,255,0.50)",textAlign:"center",marginTop:2}}>Total Institutional Funds</Text>
              </GlassView>
              {/* Quick stats */}
              <View style={[s.row,{gap:10,marginBottom:16}]}>
                {[{label:"Monthly In",amt:"+$67.4K",color:C.green},{label:"Monthly Out",amt:"-$55.9K",color:C.red},{label:"Net",amt:"+$11.5K",color:C.green}].map(stat=>(
                  <GlassView key={stat.label} tier={1} style={{flex:1,padding:12,borderRadius:14,alignItems:"center",gap:4}}>
                    <Text style={{fontSize:16,fontWeight:"800",color:stat.color}}>{stat.amt}</Text>
                    <Text style={{fontSize:11,color:C.secondary}}>{stat.label}</Text>
                  </GlassView>
                ))}
              </View>
              {/* Recent transactions */}
              <Text style={[s.sectionHeader,{marginBottom:10}]}>Recent Transactions</Text>
              {RECENT_TX.map((tx,i)=>(
                <View key={tx.id} style={[s.row,{justifyContent:"space-between",paddingVertical:12,borderBottomWidth:i<RECENT_TX.length-1?StyleSheet.hairlineWidth:0,borderBottomColor:C.separator}]}>
                  <View>
                    <Text style={{fontSize:14,fontWeight:"600",color:C.label}}>{tx.desc}</Text>
                    <Text style={{fontSize:12,color:C.secondary}}>{tx.date}</Text>
                  </View>
                  <Text style={{fontSize:15,fontWeight:"700",color:tx.amount<0?C.red:C.green}}>{tx.amount<0?"-":"+"}${Math.abs(tx.amount).toLocaleString()}</Text>
                </View>
              ))}
            </>
          )}
          {finTab==='Funds'&&(
            <>
              <Text style={[s.sectionHeader,{marginBottom:10,marginTop:4}]}>Fund Accounts</Text>
              {FUNDS.map(fa=>(
                <GlassView key={fa.id} tier={1} style={{padding:14,borderRadius:16,marginBottom:10}}>
                  <View style={[s.row,{justifyContent:"space-between",marginBottom:6}]}>
                    <View style={[s.row,{gap:6}]}>
                      <Text style={{fontSize:14,fontWeight:"700",color:C.label}}>{fa.name}</Text>
                      {fa.restricted&&<View style={{backgroundColor:C.amber+"22",borderRadius:6,paddingHorizontal:6,paddingVertical:2}}><Text style={{fontSize:10,fontWeight:"700",color:C.amber}}>RESTRICTED</Text></View>}
                    </View>
                    <Text style={{fontSize:16,fontWeight:"800",color:C.label}}>{formatCompact(fa.balance)}</Text>
                  </View>
                  <View style={[s.row,{gap:16}]}>
                    {fa.inflow>0&&<View style={[s.row,{gap:4}]}><IconSymbol name="arrow.up.circle.fill" size={13} color={C.green}/><Text style={{fontSize:12,color:C.green,fontWeight:"600"}}>+{formatCompact(fa.inflow)}</Text></View>}
                    {fa.outflow>0&&<View style={[s.row,{gap:4}]}><IconSymbol name="arrow.down.circle.fill" size={13} color={C.red}/><Text style={{fontSize:12,color:C.red,fontWeight:"600"}}>-{formatCompact(fa.outflow)}</Text></View>}
                    {fa.restricted&&<Text style={{fontSize:11,color:C.secondary,marginLeft:"auto" as any}}>Restricted-use only</Text>}
                  </View>
                </GlassView>
              ))}
            </>
          )}
          {finTab==='Payroll'&&(
            <>
              <Text style={[s.sectionHeader,{marginBottom:4,marginTop:4}]}>Payroll — April 2026</Text>
              <Text style={{fontSize:12,color:C.secondary,marginBottom:14}}>Pay date: Apr 15, 2026</Text>
              {PAYROLL.map((p,i)=>(
                <View key={i} style={[s.row,{justifyContent:"space-between",paddingVertical:12,borderBottomWidth:i<PAYROLL.length-1?StyleSheet.hairlineWidth:0,borderBottomColor:C.separator}]}>
                  <View>
                    <Text style={{fontSize:14,fontWeight:"600",color:C.label}}>{p.name}</Text>
                    <Text style={{fontSize:12,color:C.secondary}}>{p.role}</Text>
                  </View>
                  <Text style={{fontSize:15,fontWeight:"700",color:C.label}}>${p.amount.toLocaleString()}</Text>
                </View>
              ))}
              <View style={[s.row,{justifyContent:"space-between",paddingVertical:14}]}>
                <Text style={{fontSize:14,fontWeight:"700",color:C.label}}>Total Payroll</Text>
                <Text style={{fontSize:16,fontWeight:"800",color:C.label}}>${PAYROLL.reduce((a,p)=>a+p.amount,0).toLocaleString()}</Text>
              </View>
            </>
          )}
          {finTab==='Vendors'&&(
            <>
              <Text style={[s.sectionHeader,{marginBottom:10,marginTop:4}]}>Vendors</Text>
              {VENDORS.map((v,i)=>(
                <View key={i} style={[s.row,{justifyContent:"space-between",paddingVertical:12,borderBottomWidth:i<VENDORS.length-1?StyleSheet.hairlineWidth:0,borderBottomColor:C.separator}]}>
                  <View>
                    <Text style={{fontSize:14,fontWeight:"600",color:C.label}}>{v.name}</Text>
                    <Text style={{fontSize:12,color:C.secondary}}>{v.category} · Last paid {v.lastPaid}</Text>
                  </View>
                  <Pressable onPress={()=>Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)} style={{paddingHorizontal:12,paddingVertical:6,borderRadius:10,borderWidth:1,borderColor:C.separator}}>
                    <Text style={{fontSize:12,fontWeight:"600",color:C.label}}>Pay ${v.amount}</Text>
                  </Pressable>
                </View>
              ))}
            </>
          )}
          {finTab==='Budget'&&(
            <>
              <Text style={[s.sectionHeader,{marginBottom:10,marginTop:4}]}>Budget vs. Actual — Apr 2026</Text>
              {BUDGET.map((b,i)=>{
                const over=b.actual>b.budgeted;
                return(
                  <View key={i} style={{marginBottom:14}}>
                    <View style={[s.row,{justifyContent:"space-between",marginBottom:4}]}>
                      <Text style={{fontSize:13,fontWeight:"600",color:C.label}}>{b.name}</Text>
                      <Text style={{fontSize:12,color:over?C.red:C.secondary}}>{formatCompact(b.actual)} / {formatCompact(b.budgeted)}</Text>
                    </View>
                    <View style={{height:6,backgroundColor:C.separator,borderRadius:3}}>
                      <View style={{height:6,width:`${Math.min(100,Math.round(b.actual/b.budgeted*100))}%` as any,backgroundColor:over?C.red:C.label,borderRadius:3}}/>
                    </View>
                    {over&&<Text style={{fontSize:11,color:C.red,marginTop:3,fontWeight:"600"}}>Over budget by {formatCompact(b.actual-b.budgeted)}</Text>}
                  </View>
                );
              })}
            </>
          )}
            {finTab==='Reports' && (
              <>
                <Text style={{fontSize:11,fontWeight:'700',color:C.secondary,textTransform:'uppercase',letterSpacing:0.5,marginBottom:12}}>FINANCIAL REPORTS</Text>
                {[
                  {title:'Income Statement',sub:'Jan – Mar 2026 · Q1',icon:'doc.text'},
                  {title:'Balance Sheet',sub:'As of Apr 1, 2026',icon:'doc.plaintext'},
                  {title:'Cash Flow Statement',sub:'Jan – Mar 2026 · Q1',icon:'arrow.left.arrow.right'},
                  {title:'Fund Activity Report',sub:'All funds · Q1 2026',icon:'tray.full'},
                  {title:'Donor Giving Report',sub:'YTD 2026',icon:'person.2'},
                ].map((r,i,arr)=>(
                  <Pressable key={r.title} onPress={()=>Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)} style={({pressed})=>({flexDirection:'row',alignItems:'center',gap:12,backgroundColor:pressed?C.surfacePressed:C.surface,borderRadius:14,marginBottom:10,padding:16})}>
                    <View style={{width:38,height:38,borderRadius:10,backgroundColor:C.surfacePressed,alignItems:'center',justifyContent:'center'}}>
                      <IconSymbol name={r.icon as any} size={16} color={C.label}/>
                    </View>
                    <View style={{flex:1}}>
                      <Text style={{fontSize:14,fontWeight:'600',color:C.label}}>{r.title}</Text>
                      <Text style={{fontSize:12,color:C.secondary,marginTop:2}}>{r.sub}</Text>
                    </View>
                    <IconSymbol name="arrow.down.to.line" size={16} color={C.secondary}/>
                  </Pressable>
                ))}
                <Text style={{fontSize:11,fontWeight:'700',color:C.secondary,textTransform:'uppercase',letterSpacing:0.5,marginTop:6,marginBottom:12}}>YEAR-OVER-YEAR</Text>
                {[
                  {label:'Total Giving',v2025:'$498.2K',v2026:'$287.5K',note:'YTD'},
                  {label:'Total Expenses',v2025:'$412.8K',v2026:'$241.1K',note:'YTD'},
                  {label:'Net Surplus',v2025:'$85.4K',v2026:'$46.4K',note:'YTD'},
                ].map(row=>(
                  <View key={row.label} style={{backgroundColor:C.surface,borderRadius:14,marginBottom:10,padding:16}}>
                    <Text style={{fontSize:13,color:C.secondary,marginBottom:8}}>{row.label}</Text>
                    <View style={{flexDirection:'row',justifyContent:'space-between'}}>
                      <View><Text style={{fontSize:11,color:C.secondary}}>2025</Text><Text style={{fontSize:16,fontWeight:'700',color:C.label}}>{row.v2025}</Text></View>
                      <View style={{alignItems:'flex-end'}}><Text style={{fontSize:11,color:C.secondary}}>2026 {row.note}</Text><Text style={{fontSize:16,fontWeight:'700',color:C.label}}>{row.v2026}</Text></View>
                    </View>
                  </View>
                ))}
              </>
            )}
        </View>
      </ScrollView>
    );
  }

  function renderWalletTab(){
    if(mode==='personal'&&!isAdminRole){return renderSubscriberWalletView();}
    if(mode==='education'&&!isAdminRole){return renderEducationStudentWallet();}
    if(mode==='education'&&isAdminRole){return renderEducationPresidentFinance();}
    if(mode==='community'&&!isAdminRole){return renderCommunityMemberWallet();}
    if(mode==='community'&&isAdminRole){return RenderCommunityPastorFinance();}
    if(mode==='personal'&&isAdminRole){return renderWalletPersonal();}
    return isAdminRole?renderWalletInstitutional():renderWalletPersonal();
  }

  function renderPayTab(){
    return(
      <ScrollView showsVerticalScrollIndicator={false} onScroll={onScroll} scrollEventThrottle={scrollEventThrottle} contentContainerStyle={{padding:16,paddingBottom:120,paddingTop:contentPaddingTop}}>
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
                  <Text style={{fontSize:13,fontWeight:"700",color:C.label}}>{formatCurrency(rr.lastAmt)}</Text>
                  <Text style={{fontSize:11,color:C.secondary}}>{rr.lastSent}</Text>
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
      <ScrollView showsVerticalScrollIndicator={false} onScroll={onScroll} scrollEventThrottle={scrollEventThrottle} contentContainerStyle={{padding:16,paddingBottom:120,paddingTop:contentPaddingTop}}>
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
            <Text style={{fontSize:12,color:C.secondary,marginBottom:10}}>{"$"+INFRA_FUND.fundSizeM+"M fund \u00B7 "+INFRA_FUND.investors.toLocaleString()+" investors"}</Text>
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
                  <IconSymbol name={lvl.unlocked?(lvl.active?"star.fill":"checkmark.circle.fill"):"lock.fill"} size={16} color={lvl.unlocked?(lvl.active?C.accent:C.green):C.secondary}/>
                </View>
                <View style={{flex:1}}>
                  <Text style={{fontSize:14,fontWeight:lvl.active?"800":"600",color:lvl.unlocked?C.label:C.secondary}}>{"Level "+lvl.level+": "+lvl.name}</Text>
                </View>
                <View style={{backgroundColor:lvl.unlocked?"rgba(217,119,87,0.12)":C.separator,paddingHorizontal:8,paddingVertical:3,borderRadius:8}}>
                  <Text style={{fontSize:12,fontWeight:"800",color:lvl.unlocked?C.accent:C.secondary}}>{lvl.multiplier}</Text>
                </View>
              </View>
            ))}
            <Text style={{fontSize:12,fontWeight:"700",color:C.secondary,marginTop:14,marginBottom:6}}>Breakdown</Text>
            {CAPITAL_POINTS.breakdown.map(row=>(
              <View key={row.source} style={[s.row,{justifyContent:"space-between",paddingVertical:6}]}>
                <Text style={{fontSize:13,color:C.label}}>{row.source}</Text>
                <View style={[s.row,{gap:8}]}>
                  <Text style={{fontSize:12,color:C.secondary}}>{row.multiplier}</Text>
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
            <Text style={{fontSize:14,fontStyle:"italic",color:"rgba(255,255,255,0.75)",lineHeight:20,marginBottom:14}}>{'"Zero equity. Zero governance. The product IS the pitch deck."'}</Text>
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
                <IconSymbol name="magnifyingglass" size={16} color={C.secondary}/>
                <TextInput placeholder="Search name or @handle" placeholderTextColor={C.secondary} style={{flex:1,marginLeft:10,fontSize:15,color:C.label}}/>
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
              <TextInput value={sendAmount} onChangeText={setSendAmount} keyboardType="decimal-pad" placeholder="$0" placeholderTextColor={C.secondary} style={{fontSize:56,fontWeight:"800",color:C.label,textAlign:"center"}}/>
              <Pressable onPress={()=>{}} style={{alignSelf:"center"}}>
                <GlassView tier={2} style={{paddingHorizontal:14,paddingVertical:10,borderRadius:14}}>
                  <Text style={{fontSize:13,fontWeight:"600",color:C.secondary}}>{"KPay Balance · "+formatCurrency(BALANCE)}</Text>
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
                <TextInput value={sendNote} onChangeText={setSendNote} placeholder="Add a note..." placeholderTextColor={C.secondary} style={{flex:1,fontSize:15,color:C.label}}/>
              </GlassView>
              <Pressable onPress={confirmSend}>
                <View style={[s.giveBtn,{backgroundColor:C.accent}]}><Text style={s.giveBtnText}>{"Send "+(sendAmount?"$"+sendAmount:"")+" via KPay"}</Text></View>
              </Pressable>
              <Text style={{fontSize:12,color:C.secondary,textAlign:"center"}}>Face ID / Touch ID may be required</Text>
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
                <IconSymbol name="chevron.right" size={14} color={C.secondary}/>
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
                    <Text style={{fontSize:11,fontWeight:"700",color:boost.active?C.green:C.secondary}}>{boost.active?"Active":"Add"}</Text>
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

  // Business mode early returns
  if(mode==='business'&&isAdminRole) return <BusinessCEOFinanceView C={C} openSidePanel={openSidePanel} cycleRole={cycleRole} role={role}/>;
  if(mode==='business') return <BusinessCustomerBillingView C={C} openSidePanel={openSidePanel} cycleRole={cycleRole} role={role}/>;

  const isEduStudent=mode==='education'&&!isAdminRole;
  const isCommunityMember=mode==='community'&&!isAdminRole;
  const isCommunityPastor=mode==='community'&&isAdminRole;
  const showFilterBtn=activeTab!=="Pay"&&mode!=='personal'&&!isEduStudent&&!isCommunityMember&&!isCommunityPastor;
  return(
    <View style={[s.container,{backgroundColor:C.bg}]}>
      <Animated.View style={[s.topBarOuter,{paddingTop:insets.top,height:topBarH+(pillsVisible&&activeTab==="Invest"?PILL_ROW_H:0),opacity}]}>
        <View style={s.topBar}>
          <Pressable style={s.iconBtn} onPress={()=>{Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);openSidePanel();}}>
            <KMenuButton />
          </Pressable>
          <View style={{flex:1,alignItems:"center"}}>
            {mode==='personal'?(
              <Text style={{fontSize:17,fontWeight:'700',color:C.label}}>KPay</Text>
            ):isEduStudent||isCommunityMember?(
              <Text style={{fontSize:17,fontWeight:"700",color:C.label}}>Wallet</Text>
            ):isCommunityPastor?(
              <Text style={{fontSize:17,fontWeight:"700",color:C.label}}>Finance</Text>
            ):(
              <Pressable onPress={()=>{Haptics.selectionAsync();setDropdownOpen(p=>!p);}}>
                <GlassView tier={2} style={s.dropPill}>
                  <Text style={[s.dropPillText,{color:C.label}]}>{activeTab}</Text>
                  <IconSymbol name={dropdownOpen?"chevron.up":"chevron.down"} size={12} color={C.secondary} style={{marginLeft:4}}/>
                </GlassView>
              </Pressable>
            )}
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
              <IconSymbol name="line.3.horizontal.decrease.circle" size={20} color={pillsVisible?C.accent:C.label}/>
            </Pressable>
          ):(
            <View style={s.iconBtn}/>
          )}
        </View>
        {activeTab==="Invest"&&mode!=='personal'&&(
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
      </Animated.View>
      {(mode==='personal'||activeTab==="Wallet")&&renderWalletTab()}
      {activeTab==="Pay"&&mode!=='personal'&&renderPayTab()}
      {activeTab==="Invest"&&mode!=='personal'&&renderInvestTab()}
      {dropdownOpen&&mode!=='personal'&&!isEduStudent&&(
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
    topBarOuter:{position:"absolute",top:0,left:0,right:0,zIndex:10,backgroundColor:C.bg,borderBottomWidth:StyleSheet.hairlineWidth,borderBottomColor:C.separator},
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
