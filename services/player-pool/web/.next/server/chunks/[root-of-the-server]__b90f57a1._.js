module.exports=[93695,(e,t,r)=>{t.exports=e.x("next/dist/shared/lib/no-fallback-error.external.js",()=>require("next/dist/shared/lib/no-fallback-error.external.js"))},70406,(e,t,r)=>{t.exports=e.x("next/dist/compiled/@opentelemetry/api",()=>require("next/dist/compiled/@opentelemetry/api"))},18622,(e,t,r)=>{t.exports=e.x("next/dist/compiled/next-server/app-page-turbo.runtime.prod.js",()=>require("next/dist/compiled/next-server/app-page-turbo.runtime.prod.js"))},56704,(e,t,r)=>{t.exports=e.x("next/dist/server/app-render/work-async-storage.external.js",()=>require("next/dist/server/app-render/work-async-storage.external.js"))},32319,(e,t,r)=>{t.exports=e.x("next/dist/server/app-render/work-unit-async-storage.external.js",()=>require("next/dist/server/app-render/work-unit-async-storage.external.js"))},24725,(e,t,r)=>{t.exports=e.x("next/dist/server/app-render/after-task-async-storage.external.js",()=>require("next/dist/server/app-render/after-task-async-storage.external.js"))},47261,e=>e.a(async(t,r)=>{try{var a=e.i(89171),s=e.i(43793),n=t([s]);async function o(e,{params:t}){let{id:r}=await t,{rows:n}=await s.pool.query(`SELECT
       p.id,
       p.full_name,
       p.height_inches,
       p.weight_lbs,
       p.declared_positions,
       p.city_origin,
       p.state_origin,
       p.high_school,
       pts.jersey_number,
       pts.class_year,
       pts.id AS pts_id,
       t.name AS team_name,
       t.slug AS team_slug,
       t.id AS team_id,
       cl.level_key,
       cl.display_name AS level_name,
       c.name AS conf_name,
       c.abbreviation AS conf_abbr,
       kr.npd_final_kr,
       kr.college_kr_base,
       kr.primary_archetype,
       kr.all_archetypes,
       kr.confidence_pct,
       kr.system_risk_penalty,
       kr.system_risk_keys,
       kr.position,
       kr.level_key AS kr_level_key,
       kr.badge_boost,
       kr.override_boost,
       kr.override_key,
       ss.games_played,
       ss.games_started,
       ss.minutes_per_game,
       ss.pts_per_game,
       ss.reb_per_game,
       ss.ast_per_game,
       ss.stl_per_game,
       ss.blk_per_game,
       ss.to_per_game,
       ss.fg_pct,
       ss.three_pct,
       ss.ft_pct,
       ss.oreb_per_game,
       ss.dreb_per_game,
       ss.fga_per_game,
       ss.three_pa_per_game,
       ss.fta_per_game,
       ss.pf_per_game,
       ss.usage_rate,
       st.gp AS tot_gp,
       st.gs AS tot_gs,
       st.min_total,
       st.fgm,
       st.fga,
       st.three_pm,
       st.three_pa,
       st.ftm,
       st.fta,
       st.pts,
       st.orb,
       st.drb,
       st.trb,
       st.ast,
       st.tov,
       st.stl,
       st.blk,
       st.pf,
       tss.min AS team_min,
       tss.fgm AS team_fgm,
       tss.fga AS team_fga,
       tss.fta AS team_fta,
       tss.tov AS team_tov,
       tss.trb AS team_trb,
       tss.opp_fga,
       tss.opp_trb
     FROM players p
     JOIN player_team_seasons pts ON pts.player_id = p.id
     JOIN team_seasons ts ON ts.id = pts.team_season_id
     JOIN teams t ON t.id = ts.team_id
     JOIN competitive_levels cl ON cl.id = t.competitive_level_id
     LEFT JOIN conferences c ON c.id = t.conference_id
     LEFT JOIN player_kr_v2 kr ON kr.player_team_season_id = pts.id
     LEFT JOIN player_season_stats ss ON ss.player_team_season_id = pts.id
     LEFT JOIN player_season_totals st ON st.player_team_season_id = pts.id
     LEFT JOIN team_season_stats tss ON tss.team_id = t.id
     WHERE p.id = $1
     LIMIT 1`,[r]);if(0===n.length)return a.NextResponse.json({error:"Player not found"},{status:404});let o=n[0],i=o.pts_id,[l,p,_,d]=await Promise.all([s.pool.query(`SELECT cluster, score, confidence_pct, scored_traits, total_traits
       FROM player_clusters_v2
       WHERE player_team_season_id = $1
       ORDER BY cluster`,[i]),s.pool.query(`SELECT trait_key, cluster, score, status
       FROM player_traits_v2
       WHERE player_team_season_id = $1
       ORDER BY cluster, trait_key`,[i]),s.pool.query(`SELECT badge_key, badge_name, tier, effect, component, badge_group
       FROM player_badges_v2
       WHERE player_team_season_id = $1
       ORDER BY badge_key`,[i]),s.pool.query(`SELECT risk_key, risk_name, risk_type, penalty, trigger_values
       FROM player_system_risks_v2
       WHERE player_team_season_id = $1
       ORDER BY risk_type, risk_key`,[i])]),c={};for(let e of l.rows)c[e.cluster]={score:null!=e.score?Number(e.score):null,confidence:Number(e.confidence_pct)||0,scoredTraits:e.scored_traits||0,totalTraits:e.total_traits||0};let u={};for(let e of p.rows)u[e.trait_key]={score:null!=e.score?Number(e.score):null,status:e.status,cluster:e.cluster};let m=e=>null!=e?Number(e):null,g={id:o.id,name:o.full_name,position:o.position||(o.declared_positions?.[0]??null),height:m(o.height_inches),weight:m(o.weight_lbs),classYear:o.class_year||null,hometown:o.city_origin&&o.state_origin?`${o.city_origin}, ${o.state_origin}`:o.city_origin||o.state_origin||null,highSchool:o.high_school||null,jerseyNumber:o.jersey_number||null,team:{id:o.team_id,name:o.team_name,slug:o.team_slug,levelKey:o.level_key,levelName:o.level_name,conference:o.conf_name||null,confAbbr:o.conf_abbr||null},kr:{finalKr:m(o.npd_final_kr),baseKr:m(o.college_kr_base),archetype:o.primary_archetype||null,allArchetypes:o.all_archetypes||[],confidence:Number(o.confidence_pct)||0,riskPenalty:m(o.system_risk_penalty)||0,riskKeys:o.system_risk_keys||[],badgeBoost:m(o.badge_boost)||0,overrideBoost:m(o.override_boost)||0,overrideKey:o.override_key||null,krLevelKey:o.kr_level_key||null},clusters:c,traits:u,stats:{gp:m(o.games_played),gs:m(o.games_started),mpg:m(o.minutes_per_game),ppg:m(o.pts_per_game),rpg:m(o.reb_per_game),apg:m(o.ast_per_game),spg:m(o.stl_per_game),bpg:m(o.blk_per_game),topg:m(o.to_per_game),fgPct:m(o.fg_pct),threePct:m(o.three_pct),ftPct:m(o.ft_pct),orebPg:m(o.oreb_per_game),drebPg:m(o.dreb_per_game),fgaPg:m(o.fga_per_game),threePaPg:m(o.three_pa_per_game),ftaPg:m(o.fta_per_game),pfPg:m(o.pf_per_game),usageRate:m(o.usage_rate)},totals:{gp:m(o.tot_gp),gs:m(o.tot_gs),min:m(o.min_total),fgm:m(o.fgm),fga:m(o.fga),threePm:m(o.three_pm),threePa:m(o.three_pa),ftm:m(o.ftm),fta:m(o.fta),pts:m(o.pts),orb:m(o.orb),drb:m(o.drb),trb:m(o.trb),ast:m(o.ast),tov:m(o.tov),stl:m(o.stl),blk:m(o.blk),pf:m(o.pf)},teamStats:{min:m(o.team_min),fgm:m(o.team_fgm),fga:m(o.team_fga),fta:m(o.team_fta),tov:m(o.team_tov),trb:m(o.team_trb),oppFga:m(o.opp_fga),oppTrb:m(o.opp_trb)},badges:_.rows.map(e=>({key:e.badge_key,name:e.badge_name,tier:e.tier,effect:Number(e.effect),component:e.component,group:e.badge_group||null})),risks:d.rows.map(e=>({key:e.risk_key,name:e.risk_name,type:e.risk_type,penalty:Number(e.penalty),triggers:e.trigger_values||null}))};return a.NextResponse.json({player:g})}[s]=n.then?(await n)():n,e.s(["GET",()=>o]),r()}catch(e){r(e)}},!1),49453,e=>e.a(async(t,r)=>{try{var a=e.i(47909),s=e.i(74017),n=e.i(96250),o=e.i(59756),i=e.i(61916),l=e.i(74677),p=e.i(69741),_=e.i(16795),d=e.i(87718),c=e.i(95169),u=e.i(47587),m=e.i(66012),g=e.i(70101),y=e.i(26937),f=e.i(10372),h=e.i(93695);e.i(52474);var b=e.i(220),v=e.i(47261),k=t([v]);[v]=k.then?(await k)():k;let x=new a.AppRouteRouteModule({definition:{kind:s.RouteKind.APP_ROUTE,page:"/api/players/[id]/route",pathname:"/api/players/[id]",filename:"route",bundlePath:""},distDir:".next",relativeProjectDir:"",resolvedPagePath:"[project]/src/app/api/players/[id]/route.ts",nextConfigOutput:"",userland:v}),{workAsyncStorage:w,workUnitAsyncStorage:N,serverHooks:O}=x;function R(){return(0,n.patchFetch)({workAsyncStorage:w,workUnitAsyncStorage:N})}async function E(e,t,r){x.isDev&&(0,o.addRequestMeta)(e,"devRequestTimingInternalsEnd",process.hrtime.bigint());let a="/api/players/[id]/route";a=a.replace(/\/index$/,"")||"/";let n=await x.prepare(e,t,{srcPage:a,multiZoneDraftMode:!1});if(!n)return t.statusCode=400,t.end("Bad Request"),null==r.waitUntil||r.waitUntil.call(r,Promise.resolve()),null;let{buildId:v,params:k,nextConfig:R,parsedUrl:E,isDraftMode:w,prerenderManifest:N,routerServerContext:O,isOnDemandRevalidate:A,revalidateOnlyGenerated:S,resolvedPathname:C,clientReferenceManifest:T,serverActionsManifest:P}=n,I=(0,p.normalizeAppPath)(a),q=!!(N.dynamicRoutes[I]||N.routes[C]),j=async()=>((null==O?void 0:O.render404)?await O.render404(e,t,E,!1):t.end("This page could not be found"),null);if(q&&!w){let e=!!N.routes[C],t=N.dynamicRoutes[I];if(t&&!1===t.fallback&&!e){if(R.experimental.adapterPath)return await j();throw new h.NoFallbackError}}let H=null;!q||x.isDev||w||(H=C,H="/index"===H?"/":H);let F=!0===x.isDev||!q,M=q&&!F;P&&T&&(0,l.setManifestsSingleton)({page:a,clientReferenceManifest:T,serverActionsManifest:P});let D=e.method||"GET",L=(0,i.getTracer)(),U=L.getActiveScopeSpan(),$={params:k,prerenderManifest:N,renderOpts:{experimental:{authInterrupts:!!R.experimental.authInterrupts},cacheComponents:!!R.cacheComponents,supportsDynamicResponse:F,incrementalCache:(0,o.getRequestMeta)(e,"incrementalCache"),cacheLifeProfiles:R.cacheLife,waitUntil:r.waitUntil,onClose:e=>{t.on("close",e)},onAfterTaskError:void 0,onInstrumentationRequestError:(t,r,a,s)=>x.onRequestError(e,t,a,s,O)},sharedContext:{buildId:v}},K=new _.NodeNextRequest(e),B=new _.NodeNextResponse(t),J=d.NextRequestAdapter.fromNodeNextRequest(K,(0,d.signalFromNodeResponse)(t));try{let n=async e=>x.handle(J,$).finally(()=>{if(!e)return;e.setAttributes({"http.status_code":t.statusCode,"next.rsc":!1});let r=L.getRootSpanAttributes();if(!r)return;if(r.get("next.span_type")!==c.BaseServerSpan.handleRequest)return void console.warn(`Unexpected root span type '${r.get("next.span_type")}'. Please report this Next.js issue https://github.com/vercel/next.js`);let s=r.get("next.route");if(s){let t=`${D} ${s}`;e.setAttributes({"next.route":s,"http.route":s,"next.span_name":t}),e.updateName(t)}else e.updateName(`${D} ${a}`)}),l=!!(0,o.getRequestMeta)(e,"minimalMode"),p=async o=>{var i,p;let _=async({previousCacheEntry:s})=>{try{if(!l&&A&&S&&!s)return t.statusCode=404,t.setHeader("x-nextjs-cache","REVALIDATED"),t.end("This page could not be found"),null;let a=await n(o);e.fetchMetrics=$.renderOpts.fetchMetrics;let i=$.renderOpts.pendingWaitUntil;i&&r.waitUntil&&(r.waitUntil(i),i=void 0);let p=$.renderOpts.collectedTags;if(!q)return await (0,m.sendResponse)(K,B,a,$.renderOpts.pendingWaitUntil),null;{let e=await a.blob(),t=(0,g.toNodeOutgoingHttpHeaders)(a.headers);p&&(t[f.NEXT_CACHE_TAGS_HEADER]=p),!t["content-type"]&&e.type&&(t["content-type"]=e.type);let r=void 0!==$.renderOpts.collectedRevalidate&&!($.renderOpts.collectedRevalidate>=f.INFINITE_CACHE)&&$.renderOpts.collectedRevalidate,s=void 0===$.renderOpts.collectedExpire||$.renderOpts.collectedExpire>=f.INFINITE_CACHE?void 0:$.renderOpts.collectedExpire;return{value:{kind:b.CachedRouteKind.APP_ROUTE,status:a.status,body:Buffer.from(await e.arrayBuffer()),headers:t},cacheControl:{revalidate:r,expire:s}}}}catch(t){throw(null==s?void 0:s.isStale)&&await x.onRequestError(e,t,{routerKind:"App Router",routePath:a,routeType:"route",revalidateReason:(0,u.getRevalidateReason)({isStaticGeneration:M,isOnDemandRevalidate:A})},!1,O),t}},d=await x.handleResponse({req:e,nextConfig:R,cacheKey:H,routeKind:s.RouteKind.APP_ROUTE,isFallback:!1,prerenderManifest:N,isRoutePPREnabled:!1,isOnDemandRevalidate:A,revalidateOnlyGenerated:S,responseGenerator:_,waitUntil:r.waitUntil,isMinimalMode:l});if(!q)return null;if((null==d||null==(i=d.value)?void 0:i.kind)!==b.CachedRouteKind.APP_ROUTE)throw Object.defineProperty(Error(`Invariant: app-route received invalid cache entry ${null==d||null==(p=d.value)?void 0:p.kind}`),"__NEXT_ERROR_CODE",{value:"E701",enumerable:!1,configurable:!0});l||t.setHeader("x-nextjs-cache",A?"REVALIDATED":d.isMiss?"MISS":d.isStale?"STALE":"HIT"),w&&t.setHeader("Cache-Control","private, no-cache, no-store, max-age=0, must-revalidate");let c=(0,g.fromNodeOutgoingHttpHeaders)(d.value.headers);return l&&q||c.delete(f.NEXT_CACHE_TAGS_HEADER),!d.cacheControl||t.getHeader("Cache-Control")||c.get("Cache-Control")||c.set("Cache-Control",(0,y.getCacheControlHeader)(d.cacheControl)),await (0,m.sendResponse)(K,B,new Response(d.value.body,{headers:c,status:d.value.status||200})),null};U?await p(U):await L.withPropagatedContext(e.headers,()=>L.trace(c.BaseServerSpan.handleRequest,{spanName:`${D} ${a}`,kind:i.SpanKind.SERVER,attributes:{"http.method":D,"http.target":e.url}},p))}catch(t){if(t instanceof h.NoFallbackError||await x.onRequestError(e,t,{routerKind:"App Router",routePath:I,routeType:"route",revalidateReason:(0,u.getRevalidateReason)({isStaticGeneration:M,isOnDemandRevalidate:A})},!1,O),q)throw t;return await (0,m.sendResponse)(K,B,new Response(null,{status:500})),null}}e.s(["handler",()=>E,"patchFetch",()=>R,"routeModule",()=>x,"serverHooks",()=>O,"workAsyncStorage",()=>w,"workUnitAsyncStorage",()=>N]),r()}catch(e){r(e)}},!1)];

//# sourceMappingURL=%5Broot-of-the-server%5D__b90f57a1._.js.map