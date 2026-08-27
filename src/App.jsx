import React, { useState, useEffect, useRef } from "react";
import { toPng } from "html-to-image";

/* ══════════════════════════════════════════════
   命鏡 · 명경 — 거울은 꾸미지 않는다
   사주 데이터만으로 인생행로(소년→청년→중년→노년)와
   현재 운세를 미화 없이 직설로 풀어내는 앱
   ══════════════════════════════════════════════ */

/* ── 상수 ── */
const S = ["갑","을","병","정","무","기","경","신","임","계"];
const SH = ["甲","乙","丙","丁","戊","己","庚","辛","壬","癸"];
const B = ["자","축","인","묘","진","사","오","미","신","유","술","해"];
const BH = ["子","丑","寅","卯","辰","巳","午","未","申","酉","戌","亥"];
const SE = ["목","목","화","화","토","토","금","금","수","수"];
const BE = ["수","토","목","목","토","화","화","토","금","금","토","수"];
const BM = [9,5,0,1,4,2,3,5,6,7,4,8]; // 지지 정기(지장간 본기) 천간
const ELN = ["목","화","토","금","수"];
const ELC = { 목:"#6fbf73", 화:"#e05747", 토:"#d1a24a", 금:"#c9ccd1", 수:"#5f8fd9" };
const SIN_START = [5,2,11,8,5,2,11,8,5,2,11,8];
const SIN_NAMES = ["겁살","재살","천살","지살","도화살","월살","망신살","장성살","반안살","역마살","육해살","화개살"];
const CHEON = [[1,7],[0,8],[11,9],[11,9],[1,7],[0,8],[1,7],[6,2],[3,5],[3,5]];
const YUKHAP = {0:1,1:0,2:11,11:2,3:10,10:3,4:9,9:4,5:8,8:5,6:7,7:6};
const MUNCHANG = [5,6,8,9,8,9,11,0,2,3];
const YANGIN = {0:3,2:6,4:6,6:9,8:0};
const HONG = [6,8,2,7,4,4,10,9,0,8];
const WOLDEOK_G = [8,6,2,0];
const CHEONDEOK = [{t:"b",v:5},{t:"s",v:6},{t:"s",v:3},{t:"b",v:8},{t:"s",v:8},{t:"s",v:7},{t:"b",v:11},{t:"s",v:0},{t:"s",v:9},{t:"b",v:2},{t:"s",v:2},{t:"s",v:1}];
const BAEKHO = ["갑진","을미","병술","정축","무진","임술","계축"];
const GWAE = ["경진","경술","임진","임술"];
const HIDDEN = {0:[8,9],1:[9,7,5],2:[4,2,0],3:[0,1],4:[1,9,4],5:[4,6,2],6:[2,5,3],7:[3,1,5],8:[4,8,6],9:[6,7],10:[7,3,4],11:[4,0,8]};
const WONJIN = [[0,7],[1,6],[2,9],[3,8],[4,11],[5,10]];
const SAMH1 = [2,5,8], SAMH2 = [1,7,10], JAHYEONG = [4,6,9,11];
const ROYAL = [0,9,6,3];
const ZODIAC = ["쥐","소","호랑이","토끼","용","뱀","말","양","원숭이","닭","개","돼지"];
const ELP = { 목:"#2f7a35", 화:"#c22f22", 토:"#a8791a", 금:"#5f6b73", 수:"#1f5aa8" };
const CUR_YEAR = 2026;

/* ── 신살 강도·용어 사전 ── */
const SINSAL_INFO = {
  겁살:{p:3,t:"흉살",d:"빼앗기고 빼앗는 살. 강탈·수술·급격한 변동을 뜻한다. 다스리면 승부처에서 누구보다 강해진다."},
  재살:{p:3,t:"흉살",d:"수옥살이라고도 한다. 관재·구설·갇히는 기운. 권력기관과 인연이 깊어 잘 쓰면 그 힘을 다루는 자리에 선다."},
  천살:{p:2,t:"흉살",d:"하늘이 내리는 시련. 뜻밖의 재난, 윗사람으로 인한 곤란. 하늘을 경외하는 마음·신앙과 통한다."},
  지살:{p:1,t:"양면",d:"땅을 옮기는 살. 이사·이동·새 출발. 역마보다 잔잔한 변동으로, 터를 바꾸며 크는 팔자다."},
  도화살:{p:3,t:"양면",d:"복숭아꽃의 살. 매력·인기·이성사가 따른다. 잘 쓰면 사람을 끄는 업(연예·영업·콘텐츠)의 무기, 못 쓰면 색정 시비가 된다."},
  월살:{p:2,t:"흉살",d:"고초살. 씨를 뿌려도 더디 거두는 메마른 기운. 다만 축적기로 쓰면 다음 운의 밑천이 되는 약이다."},
  망신살:{p:3,t:"양면",d:"체면이 깎이는 살. 실수·구설·속이 드러남. 뒤집으면 이름이 알려지고 노출로 먹고사는 자리가 된다."},
  장성살:{p:3,t:"길신",d:"장군의 별. 주도권·승진·통솔의 기운. 길살이지만 강해서 고집과 독선으로 새기도 한다."},
  반안살:{p:2,t:"길신",d:"말안장에 오르는 살. 승진·안정·체면이 서는 자리. 윗사람의 끌어줌이 있다."},
  역마살:{p:3,t:"양면",d:"달리는 말의 살. 이동·여행·해외·분주함. 움직이며 벌어들이는 팔자로, 멈추면 오히려 탈이 난다."},
  육해살:{p:2,t:"흉살",d:"여섯 갈래의 해로움. 잔병·지체·은근한 방해가 낀다. 대신 아랫사람 덕은 보는 살이다."},
  화개살:{p:2,t:"양면",d:"꽃가마를 덮는 살. 예술·학문·종교·수집의 재주가 깊되 고독이 따른다. 홀로 파고드는 힘이다."},
  천을귀인:{p:3,t:"길신",d:"하늘이 내린 으뜸 귀인. 막다른 위기에서 사람의 도움으로 살아나는 자리다. 귀인 중 강도가 가장 세다."},
  문창귀인:{p:2,t:"길신",d:"글과 총명의 귀인. 학문·시험·문서·글재주에서 빛을 보는 자리다."},
  월덕귀인:{p:2,t:"길신",d:"달의 덕. 흉한 기운을 눅이고 사람의 인심과 음덕을 얻는 자리다."},
  천덕귀인:{p:2,t:"길신",d:"하늘의 덕. 재앙이 비껴가고 은근한 비호를 받는 자리다."},
  양인살:{p:3,t:"흉살",d:"칼날의 살. 극단의 추진력과 승부수. 잘 쓰면 베고, 못 쓰면 제 손을 다친다."},
  홍염살:{p:2,t:"양면",d:"붉은 매력의 살. 은근한 색기와 인기가 몸에 밴다. 도화보다 은밀하게 사람을 끈다."},
  공망:{p:2,t:"양면",d:"비어 있는 자리. 그 글자의 일이 헛돌고 결실이 더디거나, 오히려 집착이 사라져 정신의 자유를 얻는다."},
  백호살:{p:3,t:"흉살",d:"백호대살. 피·수술·사고수를 이르는 강한 살. 다만 그 강한 기운으로 칼과 피를 다루는 업(의료·군경 등)에서는 힘이 된다."},
  괴강살:{p:3,t:"양면",d:"우두머리의 살. 극과 극의 팔자로, 큰 그릇으로 서거나 큰 풍파를 겪는다. 총명하고 결단이 빠르다."},
};
const TERM_DEFS = {
  일간:"사주의 주인공. 태어난 날의 윗글자로, 모든 십성과 풀이의 기준점이다.",
  원국:"태어날 때 정해진 여덟 글자 그 자체. 운이 들어오기 전의 타고난 판.",
  천간:"하늘의 기운을 나타내는 열 글자(갑·을·병·정·무·기·경·신·임·계). 기둥의 윗글자.",
  지지:"땅의 기운을 나타내는 열두 글자(자·축·인·묘…). 기둥의 아랫글자로, 띠와 같다.",
  오행:"목·화·토·금·수 다섯 기운. 서로 낳고(상생) 누르는(상극) 관계로 돈다.",
  십성:"일간과 다른 글자의 관계를 열 가지로 이름 붙인 것. 재물·명예·표현·인연의 자리를 읽는 틀.",
  비견:"나와 똑같은 기운. 주체성·경쟁심·동료. 강하면 고집이 세고 재물이 갈라진다.",
  겁재:"나와 같은 오행의 다른 극성. 승부욕과 추진력이나, 심하면 재물을 빼앗는 기운.",
  식신:"내가 낳는 기운. 표현·의식주·재능. 밥그릇의 별이라 부른다.",
  상관:"내가 낳되 결이 다른 기운. 언변·창의·반골기. 조직(관)을 상하게 한다 하여 상관이다.",
  편재:"유동적인 재물. 사업·투자·큰돈의 출입. 돌지만 내 손에 오래 머물지 않는다.",
  정재:"안정적인 재물. 월급·저축·성실한 축적. 작아도 새지 않는 돈이다.",
  편관:"나를 강하게 누르는 기운(칠살). 시련·권력·카리스마. 다스리면 큰 그릇이 된다.",
  정관:"나를 바르게 다스리는 기운. 직장·명예·법과 질서.",
  편인:"나를 낳되 치우친 기운. 직관·이면의 학문·고독. 밥그릇(식신)을 엎기도 한다.",
  정인:"나를 바르게 낳는 기운. 학문·문서·자격·어머니의 보호.",
  비겁:"비견과 겁재를 묶은 말. 나와 같은 편의 세력.",
  식상:"식신과 상관을 묶은 말. 내가 밖으로 내놓는 표현의 기운.",
  재성:"편재와 정재를 묶은 말. 재물과 결과물.",
  관성:"편관과 정관을 묶은 말. 조직·명예·나를 통제하는 힘.",
  인성:"편인과 정인을 묶은 말. 나를 돕고 채워주는 기운.",
  대운:"10년 단위로 바뀌는 큰 운. 인생의 계절.",
  세운:"해마다 바뀌는 그 해의 운. 한 해의 날씨.",
  삼합:"세 지지가 모여 하나의 강한 오행 국(局)을 이루는 결합.",
  반합:"삼합 중 두 글자만 모인 절반의 결합. 완전하진 않으나 기운이 그쪽으로 쏠린다.",
  육합:"두 지지가 짝을 이뤄 묶이는 결합. 정이 드는 대신 발이 묶이기도 한다.",
  합충:"끌어당기는 합과 부딪히는 충. 사건과 변동이 일어나는 자리다.",
  충돌:"지지끼리 정면으로 부딪히는 충(沖)의 작용. 이동·단절·사건의 계기가 된다.",
  지장간:"지지 속에 숨은 천간들. 겉과 속이 다른 이유가 여기 있다.",
  자형:"같은 글자끼리 부딪히는 형(刑). 스스로를 갉는 자충수, 같은 문제의 반복.",
  상형:"자수와 묘목이 무례하게 찌르는 형. 예의·구설·손아랫사람 문제로 나타난다.",
  삼형:"세 글자가 얽히는 형. 관재·시비·수술처럼 깎이고 다듬어지는 고통이나, 법·의료·권력을 다루는 업에서는 오히려 힘이 된다.",
  원진:"서로 미워하며 등지는 살. 가까운 사이일수록 애증과 불화가 반복되는 기운.",
  신강:"일간을 돕는 세력(비겁·인성)이 우세한 팔자. 기운을 덜어 쓰는 것이 관건이다.",
  신약:"일간을 누르고 빼가는 세력(식상·재성·관성)이 우세한 팔자. 나를 채워주는 운이 귀하다.",
  중화:"돕는 세력과 빼가는 세력이 팽팽한 팔자. 어느 한쪽에 매이지 않고 운의 흐름을 탄다.",
  용신:"팔자의 균형을 잡아주는 핵심 오행. 이 기운이 들어오는 운에 일이 풀린다.",
  희신:"용신을 돕는 오행. 용신 다음으로 반가운 기운이다.",
};
const DICT = {};
Object.entries(TERM_DEFS).forEach(([k,d])=>{ DICT[k]={d}; });
Object.entries(SINSAL_INFO).forEach(([k,v])=>{ DICT[k]=v; });
[["도화","도화살"],["역마","역마살"],["화개","화개살"],["장성","장성살"],["반안","반안살"]]
  .forEach(([a,k])=>{ DICT[a]=SINSAL_INFO[k]; });
const TERM_RE = new RegExp("("+Object.keys(DICT).sort((a,b)=>b.length-a.length)
  .map(k=>k.replace(/[.*+?^${}()|[\]\\]/g,"\\$&")).join("|")+")","g");

/* ── 천문 계산 ── */
const JDN = (y,m,d) => { const a=Math.floor((14-m)/12), y2=y+4800-a, m2=m+12*a-3;
  return d+Math.floor((153*m2+2)/5)+365*y2+Math.floor(y2/4)-Math.floor(y2/100)+Math.floor(y2/400)-32045; };

const solarLon = jd => {
  const T=(jd-2451545)/36525;
  const L0=280.46646+36000.76983*T+0.0003032*T*T;
  const M=(357.52911+35999.05029*T-0.0001537*T*T)*Math.PI/180;
  const C=(1.914602-0.004817*T-0.000014*T*T)*Math.sin(M)
        +(0.019993-0.000101*T)*Math.sin(2*M)+0.000289*Math.sin(3*M);
  return (((L0+C-0.00569)%360)+360)%360;
};

const findCross = (target, lo, hi) => {
  const f = j => ((solarLon(j)-target+540)%360)-180;
  let fa = f(lo);
  for (let j=lo+1; j<=hi; j++) {
    const fb = f(j);
    if (fa<0 && fb>=0) {
      let x=j-1, y=j;
      for (let k=0;k<45;k++){ const m=(x+y)/2; if(f(m)<0) x=m; else y=m; }
      return (x+y)/2;
    }
    fa = fb;
  }
  return null;
};

/* ── 십성 ── */
const ELI = { 목:0, 화:1, 토:2, 금:3, 수:4 };
const tenGod = (dayStem, other) => {
  const me=ELI[SE[dayStem]], o=ELI[SE[other]], same=(dayStem%2)===(other%2);
  const d=(o-me+5)%5;
  return ["비견/겁재","식신/상관","편재/정재","편관/정관","편인/정인"][d].split("/")[same?0:1];
};

/* ── 명식 계산 ── */
function computeSaju({ y,m,d,h,min,gender,solarFix,zasi,noTime }) {
  let t = noTime ? 720 : h*60+min;
  if (!noTime && solarFix) t -= 32;
  let cy=y, cm=m, cd=d;
  if (!noTime && t<0) { t+=1440; const dt=new Date(Date.UTC(y,m-1,d)); dt.setUTCDate(dt.getUTCDate()-1);
    cy=dt.getUTCFullYear(); cm=dt.getUTCMonth()+1; cd=dt.getUTCDate(); }
  const hourIdx = noTime ? null : Math.floor(((t+60)%1440)/120);
  let dayJDN = JDN(cy,cm,cd);
  if (!noTime && t>=1380 && zasi==="jeong") dayJDN += 1;
  const day60 = ((dayJDN-11)%60+60)%60;

  const jd = JDN(y,m,d)-0.5+((noTime?12:h)+(noTime?0:min)/60-9)/24;
  const lam = solarLon(jd);
  const monthIdx = Math.floor((((lam-315)%360+360)%360)/30);
  const sajuYear = (m===1 || (m===2 && lam<315)) ? y-1 : y;

  const ys=((sajuYear-4)%10+10)%10, yb=((sajuYear-4)%12+12)%12;
  const mb=(monthIdx+2)%12, ms=((ys%5)*2+2+monthIdx)%10;
  const ds=day60%10, db=day60%12;
  const hs = hourIdx==null ? null : ((ds%5)*2+hourIdx)%10;

  const forward = (ys%2===0) === (gender==="male");
  let days;
  if (forward) { const c=findCross((315+30*(monthIdx+1))%360, jd-1, jd+40); days=c!=null?c-jd:15; }
  else { const c=findCross((315+30*monthIdx)%360, jd-40, jd+1); days=c!=null?jd-c:15; }
  const dAge = Math.min(10, Math.max(1, Math.round(days/3)));

  let m60=0; for(let i=0;i<60;i++){ if(i%10===ms && i%12===mb){ m60=i; break; } }
  const daeun=[];
  for(let k=1;k<=8;k++){
    const idx = forward ? (m60+k)%60 : (m60-k+60)%60;
    daeun.push({ s:idx%10, b:idx%12, start:dAge+(k-1)*10, end:dAge+k*10-1 });
  }
  const ageK = CUR_YEAR - y + 1;
  const curDaeun = daeun.filter(du=>du.start<=ageK).pop() || null;
  const se60 = ((CUR_YEAR-4)%60+60)%60;
  const seun = { s:se60%10, b:se60%12 };

  const pillars = { ys,yb,ms,mb,ds,db,hs, hb:hourIdx };
  const branches = [yb,mb,db]; if(hourIdx!=null) branches.push(hourIdx);
  const stems = [ys,ms,ds]; if(hs!=null) stems.push(hs);

  const el = {목:0,화:0,토:0,금:0,수:0};
  stems.forEach(s=>el[SE[s]]++); branches.forEach(b=>el[BE[b]]++);

  const sinsal = b => SIN_NAMES[(b-SIN_START[yb]+12)%12];
  const cheonEul = branches.filter(b=>CHEON[ds].includes(b)).map(b=>B[b]);

  const munchang = MUNCHANG[ds], yangin = YANGIN[ds]??null, hong = HONG[ds];
  const i0 = day60 - day60%10;
  const gongmang = [(i0+10)%12, (i0+11)%12];
  const woldeok = WOLDEOK_G[mb%4], cheondeok = CHEONDEOK[mb];
  const pillarStars = (s,b) => {
    const out = [sinsal(b)];
    if (CHEON[ds].includes(b)) out.push("천을귀인");
    if (b===munchang) out.push("문창귀인");
    if (s===woldeok) out.push("월덕귀인");
    if (cheondeok.t==="s" ? s===cheondeok.v : b===cheondeok.v) out.push("천덕귀인");
    if (yangin!=null && b===yangin) out.push("양인살");
    if (b===hong) out.push("홍염살");
    if (gongmang.includes(b)) out.push("공망");
    const gz = S[s]+B[b];
    if (BAEKHO.includes(gz)) out.push("백호살");
    if (GWAE.includes(gz)) out.push("괴강살");
    return out;
  };
  const pArr = [[ys,yb],[ms,mb],[ds,db]]; if (hs!=null) pArr.push([hs,hourIdx]);
  const gw=[], salset=new Set();
  pArr.forEach(([s,b])=>{ pillarStars(s,b).forEach(st=>{
    const info = DICT[st]||{};
    if (info.t==="길신") {
      const glyph = (st==="월덕귀인" || (st==="천덕귀인"&&cheondeok.t==="s")) ? S[s] : B[b];
      if (!gw.some(g=>g.name===st&&g.glyph===glyph)) gw.push({name:st, glyph});
    } else salset.add(st);
  });});
  const starSummary = { gw, sal:[...salset] };

  /* 신강약(간이 억부) */
  const me = ELI[SE[ds]];
  const isAlly = el => el===me || el===(me+4)%5;
  let ally=0, enemy=0;
  const addS=(s,w)=>{ if(s==null)return; isAlly(ELI[SE[s]]) ? ally+=w : enemy+=w; };
  const addB=(b,w)=>{ if(b==null)return; isAlly(ELI[BE[b]]) ? ally+=w : enemy+=w; };
  addS(ys,1); addS(ms,1); addS(hs,1);
  addB(yb,1.2); addB(mb,2.5); addB(db,1.5); addB(hourIdx,1.2);
  const ratio = ally/(ally+enemy);
  const verdict = ratio>=0.55 ? "신강" : ratio<=0.45 ? "신약" : "중화";
  let yongEl=null, heeEl=null, ynote="";
  if (verdict==="신약") { yongEl=ELN[(me+4)%5]; heeEl=ELN[me]; ynote="약한 일간을 인성으로 채운다"; }
  else if (verdict==="신강") {
    const cat = {[(me+1)%5]:0, [(me+2)%5]:0, [(me+3)%5]:0};
    const tally=(el,w)=>{ if(cat[el]!=null) cat[el]+=w; };
    [ys,ms,hs].forEach(s=>{ if(s!=null) tally(ELI[SE[s]],1); });
    [[yb,1.2],[mb,2.5],[db,1.5],[hourIdx,1.2]].forEach(([b,w])=>{ if(b!=null) tally(ELI[BE[b]],w); });
    const be = +Object.entries(cat).sort((a,b)=>b[1]-a[1])[0][0];
    yongEl=ELN[be]; heeEl=ELN[(be+4)%5]; ynote="강한 일간의 기운을 덜어낸다";
  } else { ynote="억부상 어느 한쪽에 매이지 않는 균형"; }
  const strength = { ally:+ally.toFixed(1), enemy:+enemy.toFixed(1), ratio, verdict };
  const yong = { el:yongEl, hee:heeEl, note:ynote };

  /* 원국 내부 지지 관계 */
  const innerRels = [];
  const pushRel = (l,k)=>{ if(!innerRels.some(r=>r.l===l)) innerRels.push({l,k}); };
  for (let i=0;i<branches.length;i++) for (let j=i+1;j<branches.length;j++) {
    const a=branches[i], c=branches[j];
    if ((a+6)%12===c) pushRel(`${B[a]}-${B[c]} 충`,"합충");
    else if (YUKHAP[a]===c) pushRel(`${B[a]}-${B[c]} 육합`,"육합");
    if (a===c && JAHYEONG.includes(a)) pushRel(`${B[a]}-${B[c]} 자형`,"자형");
    if ((a===0&&c===3)||(a===3&&c===0)) pushRel(`${B[a]}-${B[c]} 상형`,"상형");
    if (WONJIN.some(([x,y])=>(a===x&&c===y)||(a===y&&c===x))) pushRel(`${B[a]}-${B[c]} 원진`,"원진");
    if (a!==c && ((SAMH1.includes(a)&&SAMH1.includes(c))||(SAMH2.includes(a)&&SAMH2.includes(c))))
      pushRel(`${B[a]}-${B[c]} 삼형`,"삼형");
  }
  for (let g=0; g<4; g++) {
    const mem = [...new Set(branches.filter(b=>b%4===g))];
    if (mem.length>=3) pushRel(`${mem.map(b=>B[b]).join("·")} 삼합`,"삼합");
    else if (mem.length===2 && mem.includes(ROYAL[g]) && YUKHAP[mem[0]]!==mem[1] && (mem[0]+6)%12!==mem[1])
      pushRel(`${B[mem[0]]}-${B[mem[1]]} 반합`,"반합");
  }

  const rel = (target, label) => {
    const out=[];
    branches.forEach((nb,i)=>{
      const pos=["년지","월지","일지","시지"][i];
      if((nb+6)%12===target) out.push(`${pos} ${B[nb]}와 충(沖)`);
      else if(YUKHAP[nb]===target) out.push(`${pos} ${B[nb]}와 육합`);
      else if(nb%4===target%4 && nb!==target) out.push(`${pos} ${B[nb]}와 삼합`);
    });
    return out.length ? `${label} ${B[target]} — ${out.join(", ")}` : `${label} ${B[target]} — 원국과 형충합 없음`;
  };

  return { pillars, daeun, dAge, forward, curDaeun, seun, ageK, el, sinsal, cheonEul, rel,
           branches, stems, sajuYear, lam, pillarStars, gongmang, starSummary,
           strength, yong, innerRels };
}

/* ── 운이 용신에 갖는 성격 ── */
const fateOf = (sj, s, b) => {
  if (!sj.yong.el) return "중화 명식이라 특정 용신에 매이지 않는 운";
  const yi = ELI[sj.yong.el], hi = ELI[sj.yong.hee];
  const els = [ELI[SE[s]], ELI[BE[b]]];
  if (els.includes(yi)) return "용신이 드는 운";
  if (els.includes(hi)) return "희신이 드는 운";
  if (els.includes((yi+3)%5)) return "용신을 치는 운(기신 경계)";
  return "용신과 무관한 중립 운";
};

/* ── AI 컨텍스트 ── */
function buildCtx(sj, form) {
  const p = sj.pillars;
  const pil = (s,b,name) => s==null ? `${name}: 시간 미상` :
    `${name}: ${S[s]}${B[b]}(${SH[s]}${BH[b]}) 천간 ${S[s]}·${SE[s]} ${s===p.ds&&name==="일주"?"[일간]":tenGod(p.ds,s)}, 지지 ${B[b]}·${BE[b]} ${tenGod(p.ds,BM[b])}, 신살·귀인 ${sj.pillarStars(s,b).join("·")}`;
  const du = sj.daeun.map(d=>`${d.start}~${d.end}세 ${S[d.s]}${B[d.b]}(천간 ${tenGod(p.ds,d.s)}, 지지 ${tenGod(p.ds,BM[d.b])}, 신살 ${sj.pillarStars(d.s,d.b).join("·")}, ${fateOf(sj,d.s,d.b)})`).join(" / ");
  return `[명식 — ${form.name?form.name+", ":""}${form.gender==="male"?"남명":"여명"}, 양력 ${form.y}년 ${form.m}월 ${form.d}일 ${form.noTime?"시간미상":`${form.h}시 ${form.min}분`}${form.solarFix?", 진태양시 보정":""}]
${pil(p.ys,p.yb,"년주")}
${pil(p.ms,p.mb,"월주")}
${pil(p.ds,p.db,"일주")}
${p.hs==null?"시주: 시간 미상 (시주 제외하고 풀이)":pil(p.hs,p.hb,"시주")}
일간: ${S[p.ds]}(${SE[p.ds]})
신강약(간이 억부): ${sj.strength.verdict} — 일간을 돕는 세력(비겁·인성) ${sj.strength.ally} : 빼가는 세력(식상·재·관) ${sj.strength.enemy}
용신·희신: ${sj.yong.el ? `용신 ${sj.yong.el}, 희신 ${sj.yong.hee} (${sj.yong.note})` : sj.yong.note}
원국 지지 관계: ${sj.innerRels.length ? sj.innerRels.map(r=>r.l).join(", ") : "두드러진 합충형 없음"}
지장간(지지 속 숨은 천간): ${sj.branches.map(b=>`${B[b]}(${HIDDEN[b].map(s=>S[s]).join("")})`).join(" ")}
오행분포: ${ELN.map(e=>`${e}${sj.el[e]}`).join(" ")}
[오행 개운 대응] 목=청·녹색, 신맛(식초·매실 등), 동쪽 / 화=적색, 쓴맛(쑥·커피 등), 남쪽 / 토=황색, 단맛(곡물·대추 등), 중앙·흙 가까이 / 금=백색, 매운맛(생강·파 등), 서쪽 / 수=흑·남색, 짠맛(해조·콩 등), 북쪽
천을귀인: ${sj.cheonEul.length?sj.cheonEul.join(", "):"원국에 없음"}
공망(일주 기준): ${sj.gongmang.map(g=>B[g]).join("·")}
대운(${sj.forward?"순행":"역행"}, ${sj.dAge}세 시작): ${du}
현재: ${CUR_YEAR}년 병오년 세운, 나이 ${sj.ageK}세(세는나이), 현재 대운 ${sj.curDaeun?`${S[sj.curDaeun.s]}${B[sj.curDaeun.b]}(${sj.curDaeun.start}~${sj.curDaeun.end}세)`:"대운 진입 전"}
${sj.rel(sj.seun.b,"세운 지지")}
${sj.curDaeun?sj.rel(sj.curDaeun.b,"대운 지지"):""}
${CUR_YEAR} 병오년 세운의 성격: ${fateOf(sj, sj.seun.s, sj.seun.b)}
현재 대운의 성격: ${sj.curDaeun?fateOf(sj, sj.curDaeun.s, sj.curDaeun.b):"대운 진입 전"}
세운 오(午)가 년지 기준으로 갖는 신살: ${sj.sinsal(sj.seun.b)}${sj.curDaeun?` / 대운 지지 ${B[sj.curDaeun.b]}의 신살: ${sj.sinsal(sj.curDaeun.b)}`:""}`;
}

const STYLE = `너는 30년 경력의 명리학자다. 규칙:
- 미화·완곡어법·양비론 금지. 좋으면 좋다, 험하면 험하다고 고전 명리 해석 그대로 직설한다.
- 흉살, 충극, 파재, 이별수, 관재수, 고독수 같은 험한 대목도 숨기거나 물타기하지 않는다.
- 단정하되 근거를 단다. 어떤 글자·신살·십성·합충 때문인지 짧게 명시한다.
- 사망 시점을 못박거나 의학적 진단명을 내리는 것만 금지.
- 존댓말 없이 명리가의 단언체("~하다", "~한 팔자다")로 쓴다.
- 마크다운 기호(#, *, -) 없이 순수 문단으로만 쓴다.
- 제공된 신강약·용신 판정과 원국 지지 관계를 모든 풀이의 공통 전제로 삼아, 항목끼리 방향이 어긋나지 않게 하라.
- 300자가 넘는 풀이는 문단을 둘로 나눈다.
- 해석이 두 갈래로 갈릴 수 있는 대목(양면 신살, 합충의 이중 작용, 길흉이 섞인 운)에서는 긍정적 가능성 쪽을 결론으로 채택하되, 부정적 가능성도 숨기지 말고 함께 명시한다.
- 부정적 대목마다 그것을 막거나 덜어내는 액막이 조건을 구체적으로 붙인다. 명식의 용신·희신 오행을 기준으로 [오행 개운 대응]에서 색·음식·방위를 골라 명확히 지목하고, 피해야 할 행동과 시기도 함께 쓴다. "조심하라"로 끝내지 말고 무엇을 어떻게 하라고 쓴다.
- 각 항목의 본문을 마친 뒤 줄을 바꿔 "※ 쉽게 말하면:"으로 시작하는 2~3문장을 붙인다. 여기서는 명리 용어를 하나도 쓰지 않고, 누구나 알아듣는 일상어로 같은 내용을 풀어 말한다. 직설 기조는 그대로 유지한다.
- 분량을 넘기지 말고 마지막 문장까지 반드시 완결하라. 중간에 끊긴 출력은 실격이다.`;

async function callClaude(prompt, runId) {
  const res = await fetch("/api/saju", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ prompt, runId }),
  });
  const data = await res.json().catch(()=>null);
  if (!res.ok) throw new Error((data && data.error && data.error.message) || ("호출 실패 (" + res.status + ")"));
  return data.content.filter(c=>c.type==="text").map(c=>c.text).join("\n");
}
function parseSections(text) {
  const out={}, re=/\[\[(.+?)\]\]/g, marks=[]; let m;
  while ((m=re.exec(text))) marks.push({ k:m[1].trim(), e:re.lastIndex, i:m.index });
  marks.forEach((mk,idx)=>{ out[mk.k]=text.slice(mk.e, idx+1<marks.length?marks[idx+1].i:undefined).trim(); });
  return out;
}

function splitEasy(t) {
  const m = t.match(/※?\s*쉽게 말하면\s*[::]?/);
  if (!m) return { main:t.trim(), easy:null };
  return {
    main: t.slice(0, m.index).trim(),
    easy: t.slice(m.index + m[0].length).trim(),
  };
}

function buildReportText(form, sj, life, fortune, health, duText) {
  const pad = n => String(n).padStart(2, "0");
  const L = [];
  L.push("命鏡 · 명경 — 사주 감정 결과");
  L.push(`${form.name ? form.name + " · " : ""}양력 ${form.y}.${pad(form.m)}.${pad(form.d)} ${form.noTime ? "시간미상" : form.h + ":" + pad(form.min)} · ${form.gender === "male" ? "남" : "여"}`);
  const p = sj.pillars;
  const gz = (s,b) => s==null ? "미상" : S[s]+B[b];
  L.push(`명식  시주 ${gz(p.hs,p.hb)} / 일주 ${S[p.ds]}${B[p.db]} / 월주 ${S[p.ms]}${B[p.mb]} / 년주 ${S[p.ys]}${B[p.yb]}`);
  L.push(`요약  ${sj.strength.verdict} · ${sj.yong.el ? `용신 ${sj.yong.el}·희신 ${sj.yong.hee}` : sj.yong.note} · 공망 ${sj.gongmang.map(g=>B[g]).join("·")} · 대운 ${sj.forward?"순행":"역행"} ${sj.dAge}세 시작`);
  const sec = (title, text) => {
    if (!text) return;
    let grade=null, body=text;
    const m = text.match(/^\s*(대길|길|평|흉|대흉)\s*\n/);
    if (m) { grade=m[1]; body=text.slice(m[0].length).trim(); }
    const es = splitEasy(body);
    L.push(`■ ${title}${grade?` [${grade}]`:""}\n${es.main}${es.easy?`\n\n· 쉽게 말하면: ${es.easy}`:""}`);
  };
  L.push("━━━ 인생행로 ━━━");
  [["청소년기 (1~19세)","청소년기"],["청년기 (20~39세)","청년기"],["중년기 (40~59세)","중년기"],["노년기 (60세 이후)","노년기"]]
    .forEach(([t,k])=>sec(t, life && life[k]));
  L.push(`━━━ ${CUR_YEAR} 丙午년 운세 ━━━`);
  ["금전운","연애운","사업운","직장·명예운","대인관계운","건강운"].forEach(k=>sec(k, fortune && fortune[k]));
  L.push("━━━ 건강행로 ━━━");
  [["타고난 약처","타고난 약처"],["조심할 시기","조심할 시기"],["액막이 처방","액막이"]].forEach(([t,k])=>sec(t, health && health[k]));
  L.push("━━━ 대운별 풀이 ━━━");
  sj.daeun.forEach((du,i)=>sec(`${du.start}~${du.end}세 ${S[du.s]}${B[du.b]} 대운`, duText && duText[i]));
  L.push("※ 고전 명리 해석 전통에 따른 참고용 풀이이며 예언·의료·법률 조언이 아니다. 건강 대목의 실제 증상은 병원 진료가 우선이다.");
  return L.join("\n\n");
}

/* ── 프롬프트 ── */
const lifePrompt = ctx =>
  `${STYLE}\n\n${ctx}\n\n위 명식으로 평생의 행로를 네 시기로 나눠 풀이하라. 각 시기를 지나는 대운 글자와 원국의 관계(합충, 신살, 십성), 용신 성격을 근거로 실제 삶의 사건 결로 서술한다. 청소년기(1~19세)는 성정·가정환경의 기운·학업, 청년기(20~39세)는 진로·인연·좌절과 발복 시점, 중년기(40~59세)는 재물·명예의 성쇠와 부부·가족 인연의 굴곡, 노년기(60세 이후)는 말년의 형세까지 험한 대목도 그대로 쓴다. 각 시기 350자 내외.\n출력 형식을 정확히 지켜라:\n[[청소년기]]\n내용\n[[청년기]]\n내용\n[[중년기]]\n내용\n[[노년기]]\n내용`;

const fortunePrompt = ctx =>
  `${STYLE}\n\n${ctx}\n\n${CUR_YEAR}년 병오년 세운과 현재 대운을 원국에 대입해 올해의 금전운, 연애운, 사업운, 직장·명예운, 대인관계운, 건강운을 풀이하라. 각 항목의 첫 줄에는 등급 한 단어만 쓴다(대길/길/평/흉/대흉 중 하나). 둘째 줄부터 본문 220자 내외, 길흉을 분명히 가르고 근거 글자를 명시한다. 흉·대흉 항목은 마지막 문장에 그 흉을 줄일 실질적 대비책 한 문장을 붙인다. 건강운은 오행 불균형이 가리키는 경향까지만 말하고 진단은 하지 않는다.\n출력 형식을 정확히 지켜라:\n[[금전운]]\n등급\n내용\n[[연애운]]\n등급\n내용\n[[사업운]]\n등급\n내용\n[[직장·명예운]]\n등급\n내용\n[[대인관계운]]\n등급\n내용\n[[건강운]]\n등급\n내용`;

const healthPrompt = ctx =>
  `${STYLE}\n\n${ctx}\n\n[오행-장부 대응] 목=간·담·눈·근육, 화=심장·소장·혈관·순환, 토=비위·소화, 금=폐·대장·피부·호흡기, 수=신장·방광·생식·뼈·귀\n\n위 대응과 명식의 오행 과다·결핍, 지장간, 백호살 등 신살을 근거로 이 명식의 건강 행로를 풀이하라. [[타고난 약처]]에는 어느 장부 계통의 기운이 약한 팔자인지와 그 근거 글자를 220자 내외로 쓴다. [[조심할 시기]]에는 대운·세운 목록에서 그 오행이 충극당하거나 기신이 드는 구간을 골라, 몇 세 무렵·어느 대운에 어떤 증상 경향이 나타나기 쉬운지 시기별로 250자 내외로 쓴다. [[액막이]]에는 전통 개운법(보완 오행의 색·방위·계절 양생·음식의 성질)과 그 시기의 실질 대비(과로 회피, 정기 검진 등)를 220자 내외로 쓰되, 의학적 진단명 단정과 치료 지시는 금지하고 실제 증상이 있다면 병원 진료가 우선임을 한 문장 넣는다.\n출력 형식을 정확히 지켜라:\n[[타고난 약처]]\n내용\n[[조심할 시기]]\n내용\n[[액막이]]\n내용`;

const daeunBatchPrompt = (ctx, sj, from, to) => {
  const items = sj.daeun.slice(from, to).map((du, i) => {
    const n = from + i + 1;
    return `[[대운${n}]] ← ${du.start}~${du.end}세 ${S[du.s]}${B[du.b]} 대운 (천간 ${tenGod(sj.pillars.ds, du.s)}, 지지 ${tenGod(sj.pillars.ds, BM[du.b])}, 신살·귀인 ${sj.pillarStars(du.s, du.b).join("·")}, ${fateOf(sj, du.s, du.b)})`;
  });
  const marks = sj.daeun.slice(from, to).map((_, i) => `[[대운${from + i + 1}]]\n내용`).join("\n");
  return `${STYLE}\n\n${ctx}\n\n아래 네 대운을 각각 집중 풀이하라. 각 대운의 글자가 원국과 맺는 합충·신살·용신 성격을 근거로, 그 10년의 재물·인연·성패의 흐름과 조심할 대목을 시기당 350자 내외로 서술한다.\n${items.join("\n")}\n출력 형식을 정확히 지켜라(머리말 금지):\n${marks}`;
};

/* ── UI ── */
const CSS = `
  .mg-root { min-height:100vh; background:#14101a; color:#d8cfc0;
    font-family:"Nanum Myeongjo","Noto Serif KR","Songti SC",Georgia,serif;
    padding:20px 14px 60px; }
  .mg-wrap { max-width:520px; margin:0 auto; }
  .mg-title { text-align:center; margin:26px 0 4px; }
  .mg-title .hanja { font-size:44px; letter-spacing:14px; color:#ece1c8; display:block; }
  .mg-title .sub { font-size:12.5px; color:#8d8294; letter-spacing:3px; margin-top:10px; display:block; }
  .mg-card { background:#1d1723; border:1px solid #2c2434; border-radius:4px; padding:20px 18px; margin-top:20px; }
  .mg-label { font-size:12px; color:#8d8294; letter-spacing:2px; margin-bottom:7px; display:block; }
  .mg-row { display:flex; gap:8px; margin-bottom:16px; }
  .mg-input, .mg-select { flex:1; background:#141019; border:1px solid #352b40; color:#ece1c8;
    padding:11px 10px; border-radius:3px; font-size:16px; font-family:inherit; min-width:0; }
  .mg-input:focus, .mg-select:focus { outline:2px solid #c8a45f; outline-offset:1px; }
  .mg-toggle { display:flex; gap:8px; }
  .mg-tbtn { flex:1; padding:11px 0; background:#141019; border:1px solid #352b40; color:#8d8294;
    border-radius:3px; font-size:15px; font-family:inherit; cursor:pointer; }
  .mg-tbtn.on { border-color:#c8402f; color:#ece1c8; background:#241219; }
  .mg-check { display:flex; align-items:center; gap:9px; font-size:14px; color:#b3a893;
    margin-bottom:12px; cursor:pointer; }
  .mg-check input { width:17px; height:17px; accent-color:#c8402f; flex-shrink:0; margin-top:2px; align-self:flex-start; }
  .mg-hint { font-size:12px; color:#8d8294; line-height:1.7; word-break:keep-all; }
  .mg-intro p { font-size:15px; line-height:1.95; margin:0; color:#d8cfc0; word-break:keep-all; }
  .mg-intro b { color:#ece1c8; }
  .mg-slidewin { overflow:hidden; }
  .mg-slidetrack { display:flex; transition:transform .35s ease; }
  @media (prefers-reduced-motion:reduce){ .mg-slidetrack{transition:none} }
  .mg-slide { min-width:100%; padding:6px 2px 4px; box-sizing:border-box; }
  .mg-slide .sh { display:block; font-size:30px; letter-spacing:8px; color:#c8a45f; }
  .mg-slide .st { display:block; font-size:13px; letter-spacing:3px; color:#8d8294; margin:8px 0 16px; }
  .mg-dots { display:flex; gap:8px; justify-content:center; margin:20px 0 16px; }
  .mg-dot { width:8px; height:8px; border-radius:50%; border:none; background:#352b40; padding:0; cursor:pointer; }
  .mg-dot.on { background:#c8402f; }
  .mg-slidenav { display:flex; gap:8px; }
  .mg-go { width:100%; margin-top:8px; padding:15px 0; background:#c8402f; color:#f5ead6;
    border:none; border-radius:3px; font-size:17px; letter-spacing:6px; font-family:inherit;
    cursor:pointer; }
  .mg-go:active { background:#a53324; }
  /* 명식 족자 */
  .mg-pillars { display:flex; gap:9px; justify-content:center; margin-top:18px; }
  .mg-scroll { flex:1; max-width:92px; background:#ece1c8; color:#241d16; border-radius:2px;
    padding:12px 4px 10px; text-align:center; box-shadow:0 3px 0 #0b080f;
    border-top:5px solid #6d5a3a; border-bottom:5px solid #6d5a3a; }
  .mg-scroll .pname { font-size:10.5px; color:#8a7452; letter-spacing:2px; }
  .mg-scroll .han { font-size:32px; line-height:1.25; display:block; margin:5px 0 1px; }
  .mg-scroll .kor { font-size:11px; color:#5a4a33; display:block; }
  .mg-scroll .tg { font-size:10px; color:#8a7452; display:block; margin-top:2px; }
  .mg-stamp { display:inline-block; margin-top:7px; padding:3px 5px; font-size:10px;
    color:#f0e6d2; background:#c8402f; border-radius:2px; transform:rotate(-3deg); letter-spacing:1px; }
  .mg-elbar { display:flex; gap:5px; margin-top:16px; }
  .mg-el { flex:1; text-align:center; padding:8px 0 7px; border-radius:3px; background:#141019;
    border:1px solid #2c2434; font-size:12px; }
  .mg-el b { display:block; font-size:17px; margin-top:2px; }
  .mg-daeun { display:flex; gap:7px; overflow-x:auto; padding:12px 2px 10px; margin-top:14px; }
  .mg-du { min-width:62px; text-align:center; background:#141019; border:1px solid #2c2434;
    border-radius:3px; padding:9px 5px; font-size:11px; color:#8d8294; cursor:pointer;
    font-family:inherit; position:relative; }
  .mg-du.cur { border-color:#c8a45f; color:#ece1c8; background:#1e1a12; }
  .mg-du.sel { border-color:#c8402f; color:#ece1c8; background:#241219; }
  .mg-du .h { font-size:19px; color:inherit; display:block; margin:3px 0; }
  .mg-now { position:absolute; top:-8px; left:50%; transform:translateX(-50%);
    background:#c8a45f; color:#241d16; font-size:9px; letter-spacing:1px;
    padding:2px 6px; border-radius:2px; white-space:nowrap; }
  .mg-stamp.gold { background:#c8a45f; color:#241d16; transform:rotate(2deg); }
  .mg-stamp.gray { background:#5a5168; color:#e8e2d4; transform:rotate(-2deg); }
  .mg-starrow { display:flex; flex-wrap:wrap; gap:7px; margin-top:14px; }
  .mg-schip { border-radius:3px; padding:7px 11px; font-size:12.5px; font-family:inherit;
    cursor:pointer; letter-spacing:1px; background:#1d1723; }
  .mg-schip.gold { border:1px solid #c8a45f66; color:#e3cf9e; }
  .mg-schip.red { border:1px solid #c8402f66; color:#e8a99e; }
  .mg-schip.teal { border:1px solid #3f8f8a; color:#8fd0ca; background:#12201f; }
  .mg-duex { display:block; font-size:8.5px; color:#e8a99e; margin-top:2px; }
  .mg-duex.gold { color:#e3cf9e; }
  .mg-sum .sumtitle { font-size:13px; letter-spacing:3px; color:#c8a45f; margin-bottom:14px; }
  .mg-sum .sumnote { font-size:10.5px; color:#5c5266; letter-spacing:1px; margin-left:8px; }
  .mg-sum .sumrow { display:flex; gap:18px; align-items:baseline; font-size:14.5px; color:#d8cfc0; }
  .mg-sum .sumrow b { font-weight:normal; }
  .mg-sum .sumrow .mg-term { font-size:14.5px; }
  .mg-sumgauge, .sumgauge { height:7px; background:#141019; border:1px solid #2c2434;
    border-radius:4px; margin-top:10px; overflow:hidden; }
  .sumgauge div { height:100%; background:linear-gradient(90deg,#c8a45f,#c8402f); }
  .sumlegend { font-size:11.5px; color:#8d8294; margin-top:6px; }
  .mg-chip.rel { border-color:#5a5168; color:#c9bfd3; }
  .mg-grade { display:inline-block; margin-left:10px; font-size:11px; padding:2px 9px;
    border-radius:2px; vertical-align:2px; letter-spacing:1px; }
  .g-대길, .g-길 { background:#c8a45f; color:#241d16; }
  .g-평 { background:#352b40; color:#d8cfc0; }
  .g-흉, .g-대흉 { background:#c8402f; color:#f0e6d2; }
  .mg-progbar { width:210px; height:5px; margin:22px auto 0; background:#1d1723;
    border:1px solid #2c2434; border-radius:3px; overflow:hidden; }
  .mg-progbar div { height:100%; background:#c8a45f; transition:width .5s ease; }
  .mg-progtxt { font-size:12px; color:#5c5266; margin-top:9px; letter-spacing:1px; }
  .mg-sub2 { text-align:center; font-size:12px; color:#8d8294; margin-top:8px; letter-spacing:1px; }
  .mg-ducap { font-size:11.5px; color:#8d8294; margin-top:16px; letter-spacing:1px; text-align:center; }
  .mg-stampbtn { border:none; font-family:inherit; cursor:pointer; }
  .mg-term { background:none; border:none; padding:0; font:inherit; color:#c8a45f;
    border-bottom:1px dotted #c8a45f; cursor:pointer; }
  .mg-dudetail .duhead { display:flex; align-items:baseline; gap:10px; flex-wrap:wrap; }
  .mg-dudetail .duhan { font-size:26px; color:#ece1c8; }
  .mg-dudetail .duage { font-size:13px; color:#c8a45f; letter-spacing:2px; }
  .mg-chips { display:flex; gap:6px; flex-wrap:wrap; margin-top:10px; }
  .mg-chip { background:#141019; border:1px solid #352b40; color:#b3a893; font-size:12px;
    padding:5px 9px; border-radius:2px; font-family:inherit; cursor:pointer; }
  .mg-chip.red { border-color:#c8402f; color:#e8b0a6; }
  .mg-chip.gold { border-color:#c8a45f; color:#e3cf9e; }
  .mg-dubtn { width:100%; margin-top:14px; padding:12px 0; background:#141019;
    border:1px solid #c8402f; color:#e08a7d; border-radius:3px; font-size:14px;
    letter-spacing:3px; font-family:inherit; cursor:pointer; }
  .mg-sheetov { position:fixed; inset:0; background:rgba(8,6,12,.72); z-index:50;
    display:flex; align-items:flex-end; justify-content:center; }
  .mg-sheet { background:#1d1723; border:1px solid #352b40; border-bottom:none;
    border-radius:8px 8px 0 0; padding:22px 20px 30px; width:100%; max-width:520px;
    box-sizing:border-box; animation:mgup .25s ease; }
  @keyframes mgup { from{transform:translateY(30px);opacity:0} to{transform:none;opacity:1} }
  @media (prefers-reduced-motion:reduce){ .mg-sheet{animation:none} }
  .mg-sheet h3 { margin:0; font-size:19px; color:#ece1c8; letter-spacing:2px; font-weight:normal; }
  .mg-sheet .tag { display:inline-block; margin-left:10px; font-size:11px; padding:2px 8px;
    border-radius:2px; vertical-align:2px; }
  .mg-sheet .tag.길신 { background:#c8a45f; color:#241d16; }
  .mg-sheet .tag.흉살 { background:#c8402f; color:#f0e6d2; }
  .mg-sheet .tag.양면 { background:#352b40; color:#d8cfc0; }
  .mg-pow { margin:10px 0 0; font-size:12px; color:#8d8294; letter-spacing:1px; }
  .mg-pow .dots { color:#c8402f; letter-spacing:3px; margin-left:6px; }
  .mg-sheet p { font-size:14.5px; line-height:1.9; color:#d8cfc0; margin:12px 0 0; word-break:keep-all; }
  .mg-sheet .close { width:100%; margin-top:18px; padding:11px 0; background:#141019;
    border:1px solid #352b40; color:#8d8294; border-radius:3px; font-family:inherit;
    font-size:13px; letter-spacing:3px; cursor:pointer; }
  .mg-stage { animation:mgfade .5s ease; }
  @keyframes mgfade { from{opacity:0} to{opacity:1} }
  .mg-easy { margin-top:14px; padding:12px 14px; background:#141019;
    border-left:3px solid #c8a45f; border-radius:0 3px 3px 0;
    font-size:14px; line-height:1.85; color:#b3a893; word-break:keep-all; white-space:pre-wrap; }
  .mg-easy .lab { display:block; font-size:11px; letter-spacing:3px; color:#c8a45f; margin-bottom:6px; }
  .mg-tabs { display:flex; gap:8px; margin-top:24px; }
  .mg-tab { flex:1; padding:13px 0; text-align:center; background:#1d1723; border:1px solid #2c2434;
    color:#8d8294; border-radius:3px; cursor:pointer; font-size:13.5px; letter-spacing:1px; font-family:inherit; }
  .mg-tab.on { border-color:#c8a45f; color:#ece1c8; }
  .mg-stage { margin-top:16px; }
  .mg-stage .era { font-size:13px; color:#c8a45f; letter-spacing:4px; }
  .mg-stage .era .h { font-size:19px; margin-right:8px; }
  .mg-stage p { font-size:15.5px; line-height:1.95; margin:10px 0 0; white-space:pre-wrap;
    color:#d8cfc0; word-break:keep-all; }
  .mg-load { text-align:center; padding:34px 0; color:#8d8294; font-size:14px; letter-spacing:2px; }
  .mg-load.big { padding:110px 0 90px; font-size:16px; color:#b3a893; }
  .mg-load.big .flame { font-size:40px; margin-bottom:22px; }
  .mg-loadmsg { display:inline-block; animation:mgfade .6s ease; }
  .mg-dusin { display:block; font-size:9.5px; color:#8d8294; margin-top:4px; letter-spacing:0; }
  .mg-dusin b { display:block; color:#c8402f; font-weight:normal; letter-spacing:2px; font-size:8px; margin-top:1px; }
  .mg-du.cur .mg-dusin { color:#b3a893; }
  .mg-load .flame { font-size:26px; display:block; margin-bottom:12px; animation:mgp 1.6s ease-in-out infinite; }
  @keyframes mgp { 0%,100%{opacity:.35} 50%{opacity:1} }
  @media (prefers-reduced-motion:reduce){ .mg-load .flame{animation:none} }
  .mg-err { color:#e08a7d; font-size:14px; text-align:center; padding:18px 0; }
  .mg-retry { display:block; margin:6px auto 0; background:none; border:1px solid #c8402f;
    color:#e08a7d; padding:8px 22px; border-radius:3px; font-family:inherit; cursor:pointer; }
  .mg-foot { text-align:center; font-size:11.5px; color:#5c5266; margin-top:38px; line-height:1.8; }
  .mg-savebar { display:flex; gap:8px; margin-top:24px; }
  .mg-tbtn:disabled { opacity:.5; cursor:default; }
  .mg-back { background:none; border:none; color:#8d8294; font-size:13px; font-family:inherit;
    cursor:pointer; padding:6px 0; letter-spacing:2px; }
`;

const LOAD_MSGS = ["천기를 누설하는 중","여덟 글자를 세우는 중","대운의 계절을 짚는 중","신살의 결을 읽는 중","丙午년 하늘을 살피는 중","운세를 받아 적는 중","평생의 행로를 적어 내리는 중"];

const store = {
  get: async k => { const v = localStorage.getItem(k); return v == null ? null : { value: v }; },
  set: async (k, v) => { localStorage.setItem(k, v); },
};

const nums = (a,b) => Array.from({length:b-a+1},(_,i)=>a+i);

export default function App() {
  const [step, setStep] = useState("intro");
  const [slide, setSlide] = useState(0);
  const [touchX, setTouchX] = useState(null);
  const [form, setForm] = useState({ name:"", gender:"male", y:1990, m:1, d:1, h:12, min:0,
    noTime:false, solarFix:true, zasi:"jeong" });
  const [sj, setSj] = useState(null);
  const [tab, setTab] = useState("life");
  const [life, setLife] = useState(null);
  const [fortune, setFortune] = useState(null);
  const [health, setHealth] = useState(null);
  const [failed, setFailed] = useState(null);
  const [failMsg, setFailMsg] = useState(null);
  const [loadMsg, setLoadMsg] = useState(0);
  const [sheet, setSheet] = useState(null);
  const [selDu, setSelDu] = useState(null);
  const [duText, setDuText] = useState({});
  const [prog, setProg] = useState({ done:0, total:0 });
  const [lastForm, setLastForm] = useState(null);
  const resultsRef = useRef({ life:{}, fortune:{}, health:{}, duText:{} });
  const runIdRef = useRef("");

  const set = (k,v) => setForm(f=>{
    const n = {...f, [k]:v};
    const dim = new Date(n.y, n.m, 0).getDate();
    if (n.d > dim) n.d = dim;
    return n;
  });

  const storeKey = f => `mg6:${f.y}-${f.m}-${f.d}-${f.noTime?"x":f.h+"_"+f.min}-${f.gender}-${f.solarFix?1:0}-${f.zasi}`;

  useEffect(()=>{ (async()=>{
    try { const r = await store.get("mg:last");
      if (r) setLastForm(JSON.parse(r.value)); } catch(e){}
  })(); }, []);

  useEffect(()=>{
    if (step!=="loading") return;
    const t = setInterval(()=>setLoadMsg(m=>(m+1)%LOAD_MSGS.length), 2200);
    return ()=>clearInterval(t);
  }, [step]);

  const loadAll = async (s, keys, f) => {
    const ctx = buildCtx(s, f||form);
    const todo = keys || ["life","fortune","health","da","db"];
    setProg({ done:0, total:todo.length });
    setFailMsg(null);
    const fail=[]; let done=0;
    const bump = ()=>{ done++; setProg({ done, total:todo.length }); };
    const miss = e => { if (!fail.length) setFailMsg((e && e.message) || null); };
    const take = (k, text) => {
      if (k==="life") {
        const add = parseSections(text);
        Object.assign(resultsRef.current.life, add);
        setLife(p=>({ ...(p||{}), ...add }));
      } else if (k==="fortune") {
        const add = parseSections(text);
        Object.assign(resultsRef.current.fortune, add);
        setFortune(p=>({ ...(p||{}), ...add }));
      } else if (k==="health") {
        const add = parseSections(text);
        Object.assign(resultsRef.current.health, add);
        setHealth(p=>({ ...(p||{}), ...add }));
      } else {
        const sec = parseSections(text); const add = {};
        Object.entries(sec).forEach(([kk,v])=>{ const m = kk.match(/대운\s*(\d+)/); if (m) add[+m[1]-1] = v.trim(); });
        Object.assign(resultsRef.current.duText, add);
        setDuText(p=>({ ...p, ...add }));
      }
    };

    // 1단계: 인생행로 총론을 먼저 확정한다 (모든 풀이의 일관성 기준)
    if (todo.includes("life")) {
      try { take("life", await callClaude(lifePrompt(ctx), runIdRef.current)); }
      catch(e){ miss(e); fail.push("life"); }
      bump();
    }

    // 2단계: 확정된 총론을 전제로 운세·대운을 병렬 생성한다
    const lifeNow = resultsRef.current.life || {};
    const anchor = ["청소년기","청년기","중년기","노년기"].filter(k=>lifeNow[k])
      .map(k=>`[${k}] ${splitEasy(lifeNow[k]).main}`).join("\n");
    const ctx2 = anchor
      ? `${ctx}\n\n[이미 확정된 인생행로 총론]\n${anchor}\n[규칙] 아래에 쓰는 모든 풀이는 위 총론과 사실·길흉의 방향이 어긋나면 안 된다. 같은 시기를 다룰 때는 총론의 판단을 그대로 이어받아 근거와 사건을 더 구체화하라.`
      : ctx;
    const prompts = {
      fortune: () => fortunePrompt(ctx2),
      health: () => healthPrompt(ctx2),
      da: () => daeunBatchPrompt(ctx2, s, 0, 4),
      db: () => daeunBatchPrompt(ctx2, s, 4, 8),
    };
    const rest = todo.filter(k=>k!=="life");
    const rs = await Promise.allSettled(rest.map(k=>callClaude(prompts[k](), runIdRef.current)));
    rs.forEach((r,i)=>{
      const k = rest[i]; bump();
      if (r.status!=="fulfilled"){ miss(r.reason); fail.push(k); return; }
      take(k, r.value);
    });
    return fail;
  };

  const saveCache = async (f) => {
    try {
      await store.set(storeKey(f), JSON.stringify(resultsRef.current));
      await store.set("mg:last", JSON.stringify(f));
      setLastForm(f);
    } catch(e){}
  };

  const start = async (fArg) => {
    const f = fArg || form;
    if (fArg) setForm(fArg);
    const s = computeSaju(f);
    setSj(s); setLife(null); setFortune(null); setHealth(null); setTab("life");
    setSelDu(null); setDuText({}); setSheet(null); setFailed(null); setLoadMsg(0);
    resultsRef.current = { life:{}, fortune:{}, health:{}, duText:{} };
    runIdRef.current = Date.now().toString(36) + Math.random().toString(36).slice(2, 10);
    try {
      const hit = await store.get(storeKey(f));
      if (hit) {
        const d = JSON.parse(hit.value);
        resultsRef.current = d;
        setLife(d.life); setFortune(d.fortune); setHealth(d.health||null); setDuText(d.duText||{});
        setStep("result");
        return;
      }
    } catch(e){}
    setStep("loading");
    const fail = await loadAll(s, null, f);
    if (fail.length) setFailed(fail);
    else { await saveCache(f); setStep("result"); }
  };

  const retry = async () => {
    const keys = failed; setFailed(null);
    const fail = await loadAll(sj, keys, form);
    if (fail.length) setFailed(fail);
    else { await saveCache(form); setStep("result"); }
  };

  const [saving, setSaving] = useState(false);
  const resultRef = useRef(null);
  const fileStem = () => `명경_${form.y}${String(form.m).padStart(2,"0")}${String(form.d).padStart(2,"0")}${form.name?"_"+form.name:""}`;
  const saveTxt = () => {
    const txt = buildReportText(form, sj, life, fortune, health, duText);
    const blob = new Blob(["\ufeff"+txt], { type:"text/plain;charset=utf-8" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob); a.download = fileStem()+".txt";
    a.click(); URL.revokeObjectURL(a.href);
  };
  const savePng = async () => {
    if (!resultRef.current || saving) return;
    setSaving(true);
    try {
      const url = await toPng(resultRef.current, { backgroundColor:"#14101a", pixelRatio:2 });
      const a = document.createElement("a"); a.href = url; a.download = fileStem()+".png"; a.click();
    } catch(e){ alert("이미지 저장에 실패했다: " + e.message); }
    setSaving(false);
  };

  const T = ({ text }) => (
    <>{String(text).split(TERM_RE).map((p,i)=>
      DICT[p]
        ? <button key={i} className="mg-term" onClick={()=>setSheet(p)}>{p}</button>
        : <React.Fragment key={i}>{p}</React.Fragment>)}</>
  );

  const switchTab = t => setTab(t);

  const Pillar = ({ s, b, name }) => (
    <div className="mg-scroll">
      <span className="pname">{name}</span>
      {s==null ? <><span className="han">未</span><span className="kor">시간 미상</span></> : <>
        <span className="han" style={{color:ELP[SE[s]]}}>{SH[s]}</span>
        <span className="kor">{S[s]} · {SE[s]}{s!==sj.pillars.ds||name!=="일주"? " · "+tenGod(sj.pillars.ds,s):""}</span>
        <span className="han" style={{color:ELP[BE[b]]}}>{BH[b]}</span>
        <span className="kor">{B[b]} · {BE[b]}</span>
        <span className="tg">{tenGod(sj.pillars.ds, BM[b])}</span>
        {sj.pillarStars(s,b).map(st=>(
          <button key={st}
            className={"mg-stamp mg-stampbtn"+(DICT[st]&&DICT[st].t==="길신"?" gold":st==="공망"?" gray":"")}
            onClick={()=>setSheet(st)}>{st}</button>
        ))}
      </>}
    </div>
  );

  const Stage = ({ hanja, name, text }) => {
    if (!text) return null;
    let grade=null, body=text;
    const m = text.match(/^\s*(대길|길|평|흉|대흉)\s*\n/);
    if (m) { grade=m[1]; body=text.slice(m[0].length).trim(); }
    const { main, easy } = splitEasy(body);
    return (
      <div className="mg-card mg-stage">
        <div className="era"><span className="h">{hanja}</span>{name}
          {grade && <span className={"mg-grade g-"+grade}>{grade}</span>}
        </div>
        <p><T text={main} /></p>
        {easy && <div className="mg-easy"><span className="lab">쉽게 말하면</span>{easy}</div>}
      </div>
    );
  };

  const Loading = ({ msg }) => (
    <div className="mg-load"><span className="flame">灯</span>{msg}</div>
  );

  return (
    <div className="mg-root">
      <style>{CSS}</style>
      <div className="mg-wrap">
        <div className="mg-title">
          <span className="hanja">命鏡</span>
          <span className="sub">명 경 — 거울은 꾸미지 않는다</span>
        </div>

        {step==="intro" && (()=>{
          const slides = [
            { h:"四柱八字", t:"사주팔자란",
              body:<p><b>사주팔자</b>는 태어난 해·달·날·시각을 각각 하늘의 글자(천간)와 땅의 글자(지지)로 옮겨 세운 <b>네 개의 기둥, 여덟 글자</b>다. 이 여덟 글자가 이루는 오행(목·화·토·금·수)의 균형과 글자끼리의 합·충이 그 사람이 타고난 그릇과 기질을 보여준다.</p> },
            { h:"大運 歲運", t:"운은 계절이다",
              body:<p>타고난 여덟 글자는 평생 바뀌지 않지만, 삶은 <b>대운</b>이라는 10년 단위의 계절과 <b>세운</b>이라는 한 해의 날씨를 지나며 굴곡을 만든다. 같은 그릇이라도 어느 계절을 지나느냐에 따라 채워지기도, 비워지기도 한다.</p> },
            { h:"神煞", t:"신살, 기운의 이름",
              body:<p>도화살·역마살·화개살 같은 <b>신살</b>은 팔자에 흐르는 기운의 결에 이름을 붙인 것이다. 쓰기에 따라 재능이 되기도, 굴레가 되기도 한다. 명경은 타고난 신살과 운으로 들어오는 신살을 함께 짚는다.</p> },
            { h:"命鏡", t:"거울은 꾸미지 않는다",
              body:<p>명경은 이 여덟 글자와 대운·세운만으로 <b>청소년기부터 노년기까지의 행로</b>와 <b>올해의 운세</b>를 풀어낸다. 풀이는 거울처럼 — <b>좋으면 좋다, 험하면 험하다고 꾸미지 않고 그대로</b> 비춘다. 듣기 좋은 말을 원한다면 이 거울은 맞지 않다.</p> },
          ];
          const last = slide === slides.length-1;
          const go = i => setSlide(Math.max(0, Math.min(slides.length-1, i)));
          return (
            <div className="mg-card mg-intro"
              onTouchStart={e=>setTouchX(e.touches[0].clientX)}
              onTouchEnd={e=>{ if(touchX==null) return;
                const dx=e.changedTouches[0].clientX-touchX;
                if(dx<-40) go(slide+1); else if(dx>40) go(slide-1);
                setTouchX(null); }}>
              <div className="mg-slidewin">
                <div className="mg-slidetrack" style={{transform:`translateX(-${slide*100}%)`}}>
                  {slides.map((s,i)=>(
                    <div className="mg-slide" key={i}>
                      <span className="sh">{s.h}</span>
                      <span className="st">{s.t}</span>
                      {s.body}
                    </div>
                  ))}
                </div>
              </div>
              <div className="mg-dots">
                {slides.map((_,i)=>(
                  <button key={i} className={"mg-dot"+(i===slide?" on":"")}
                    aria-label={`${i+1}번째 안내`} onClick={()=>go(i)} />
                ))}
              </div>
              <div className="mg-slidenav">
                <button className="mg-tbtn" style={{visibility:slide===0?"hidden":"visible"}}
                  onClick={()=>go(slide-1)}>이전</button>
                {last
                  ? <button className="mg-go" style={{flex:1.6, marginTop:0}} onClick={()=>setStep("input")}>시작하기</button>
                  : <button className="mg-tbtn on" style={{flex:1.6}} onClick={()=>go(slide+1)}>다음</button>}
              </div>
            </div>
          );
        })()}

        {step==="input" && (
          <div className="mg-card">
            <span className="mg-label">이 름 (선택)</span>
            <div className="mg-row">
              <input className="mg-input" value={form.name} placeholder="이름 또는 별칭"
                onChange={e=>set("name",e.target.value)} maxLength={12} />
            </div>

            <span className="mg-label">성 별</span>
            <div className="mg-toggle" style={{marginBottom:16}}>
              <button className={"mg-tbtn"+(form.gender==="male"?" on":"")} onClick={()=>set("gender","male")}>남</button>
              <button className={"mg-tbtn"+(form.gender==="female"?" on":"")} onClick={()=>set("gender","female")}>여</button>
            </div>

            <span className="mg-label">생년월일 (양력)</span>
            <div className="mg-row">
              <select className="mg-select" value={form.y} onChange={e=>set("y",+e.target.value)}>
                {nums(1930,2026).reverse().map(v=><option key={v} value={v}>{v}년</option>)}
              </select>
              <select className="mg-select" value={form.m} onChange={e=>set("m",+e.target.value)}>
                {nums(1,12).map(v=><option key={v} value={v}>{v}월</option>)}
              </select>
              <select className="mg-select" value={form.d} onChange={e=>set("d",+e.target.value)}>
                {nums(1, new Date(form.y, form.m, 0).getDate()).map(v=><option key={v} value={v}>{v}일</option>)}
              </select>
            </div>

            <span className="mg-label">태어난 시각</span>
            <div className="mg-row">
              <select className="mg-select" value={form.h} disabled={form.noTime} onChange={e=>set("h",+e.target.value)}>
                {nums(0,23).map(v=><option key={v} value={v}>{v}시</option>)}
              </select>
              <select className="mg-select" value={form.min} disabled={form.noTime} onChange={e=>set("min",+e.target.value)}>
                {nums(0,59).map(v=><option key={v} value={v}>{v}분</option>)}
              </select>
            </div>
            <label className="mg-check">
              <input type="checkbox" checked={form.noTime} onChange={e=>set("noTime",e.target.checked)} />
              시각을 모른다 (시주 제외)
            </label>
            <label className="mg-check">
              <input type="checkbox" checked={form.solarFix} disabled={form.noTime}
                onChange={e=>set("solarFix",e.target.checked)} />
              진태양시 보정 −32분 <span className="mg-hint">(시계는 일본 기준 경도로 맞춰져 있어 한국 하늘의 실제 태양보다 약 32분 빠르다. 이를 빼서 태어난 시각의 기둥을 실제 태양 위치대로 세우는 보정)</span>
            </label>
            <span className="mg-label" style={{marginTop:4}}>자시 처리</span>
            <div className="mg-toggle" style={{marginBottom:14}}>
              <button className={"mg-tbtn"+(form.zasi==="jeong"?" on":"")} onClick={()=>set("zasi","jeong")}>정자시법 (통설)</button>
              <button className={"mg-tbtn"+(form.zasi==="ya"?" on":"")} onClick={()=>set("zasi","ya")}>야자시법</button>
            </div>

            <button className="mg-go" onClick={()=>start()}>명식을 세운다</button>
            <div className="mg-hint" style={{display:"block",textAlign:"center",marginTop:10}}>
              감정에는 20~40초가 걸린다. 같은 기기의 같은 사주는 다음부터 바로 뜬다. 하루 3회까지.</div>
            {lastForm &&
              <button className="mg-tbtn" style={{width:"100%",marginTop:14}}
                onClick={()=>start(lastForm)}>
                지난 감정 다시 보기 · {lastForm.name?lastForm.name+" · ":""}{lastForm.y}.{lastForm.m}.{lastForm.d}
              </button>}
          </div>
        )}

        {step==="loading" && (
          <div className="mg-load big">
            <span className="flame">灯</span>
            {failed
              ? <div className="mg-err">{failMsg || "하늘이 잠시 흐려 일부를 읽지 못했다."}
                  <button className="mg-retry" onClick={retry}>다시 읽는다</button></div>
              : <>
                  <span key={loadMsg} className="mg-loadmsg">{LOAD_MSGS[loadMsg]}</span>
                  <div className="mg-progbar"><div style={{width:(prog.total?Math.max(6,prog.done/prog.total*100):6)+"%"}} /></div>
                  <div className="mg-progtxt">천기 {prog.total||5}장 중 {prog.done}장을 읽었다</div>
                </>}
          </div>
        )}

        {step==="result" && sj && (
          <div ref={resultRef} style={{background:"#14101a"}}>
            {form.name && <div style={{textAlign:"center",fontSize:14,color:"#c8a45f",letterSpacing:3,marginTop:18}}>{form.name}의 명식</div>}
            <div className="mg-sub2">
              양력 {form.y}.{form.m}.{form.d} {form.noTime?"시간미상":`${form.h}:${String(form.min).padStart(2,"0")}`}
              {" · "}{S[sj.pillars.ys]}{B[sj.pillars.yb]}년 {ZODIAC[sj.pillars.yb]}띠
              {" · "}공망 {sj.gongmang.map(g=>B[g]).join("·")}
            </div>
            <div className="mg-pillars">
              <Pillar s={sj.pillars.hs} b={sj.pillars.hb} name="시주" />
              <Pillar s={sj.pillars.ds} b={sj.pillars.db} name="일주" />
              <Pillar s={sj.pillars.ms} b={sj.pillars.mb} name="월주" />
              <Pillar s={sj.pillars.ys} b={sj.pillars.yb} name="년주" />
            </div>

            <div className="mg-elbar">
              {ELN.map(e=>(
                <div className="mg-el" key={e} style={{borderColor: sj.el[e]===0?"#c8402f55":"#2c2434"}}>
                  <span style={{color:ELC[e]}}>{e}</span><b style={{color:ELC[e]}}>{sj.el[e]}</b>
                </div>
              ))}
            </div>

            <div className="mg-starrow">
              {sj.starSummary.gw.map((c,i)=>(
                <button key={"g"+i} className="mg-schip gold" onClick={()=>setSheet(c.name)}>✦ {c.name} {c.glyph}</button>))}
              {sj.starSummary.sal.map((n,i)=>(
                <button key={"s"+i} className="mg-schip red" onClick={()=>setSheet(n)}>{n}</button>))}
              {sj.pillarStars(sj.seun.s, sj.seun.b).map((n,i)=>(
                <button key={"se"+i} className="mg-schip teal" onClick={()=>setSheet(n)}>세운 · {n}</button>))}
              {sj.curDaeun && sj.pillarStars(sj.curDaeun.s, sj.curDaeun.b).map((n,i)=>(
                <button key={"du"+i} className="mg-schip teal" onClick={()=>setSheet(n)}>대운 · {n}</button>))}
            </div>

            <div className="mg-card mg-sum">
              <div className="sumtitle">명식 요약 <span className="sumnote">간이 억부 판정</span></div>
              <div className="sumrow">
                <span>일간 <b style={{color:ELC[SE[sj.pillars.ds]]}}>{S[sj.pillars.ds]}({SE[sj.pillars.ds]})</b></span>
                <button className="mg-term" onClick={()=>setSheet(sj.strength.verdict)}>{sj.strength.verdict}</button>
              </div>
              <div className="sumgauge"><div style={{width:(sj.strength.ratio*100)+"%"}} /></div>
              <div className="sumlegend">돕는 세력(비겁·인성) {sj.strength.ally} · 빼가는 세력(식상·재·관) {sj.strength.enemy}</div>
              <div className="sumrow" style={{marginTop:12}}>
                {sj.yong.el ? <>
                  <span><button className="mg-term" onClick={()=>setSheet("용신")}>용신</button>{" "}
                    <b style={{color:ELC[sj.yong.el]}}>{sj.yong.el}</b></span>
                  <span><button className="mg-term" onClick={()=>setSheet("희신")}>희신</button>{" "}
                    <b style={{color:ELC[sj.yong.hee]}}>{sj.yong.hee}</b></span>
                </> : <span style={{fontSize:13,color:"#b3a893"}}>{sj.yong.note}</span>}
              </div>
              <div className="sumrow" style={{marginTop:12}}>
                <span>2026 丙午년</span>
                <b style={{color: fateOf(sj,sj.seun.s,sj.seun.b).includes("용신이")||fateOf(sj,sj.seun.s,sj.seun.b).includes("희신")
                  ? "#e3cf9e" : fateOf(sj,sj.seun.s,sj.seun.b).includes("치는") ? "#e8a99e" : "#b3a893",
                  fontSize:13.5}}>{fateOf(sj, sj.seun.s, sj.seun.b)}</b>
              </div>
              {sj.innerRels.length>0 && (
                <div className="mg-chips" style={{marginTop:12}}>
                  {sj.innerRels.map((r,i)=>(
                    <button key={i} className="mg-chip rel" onClick={()=>setSheet(r.k)}>{r.l}</button>))}
                </div>
              )}
            </div>

            <div className="mg-ducap">대운수 {sj.dAge} · {sj.forward?"순행":"역행"} · 10년 주기 · 세는나이 기준</div>
            <div className="mg-daeun">
              {sj.daeun.map((du,i)=>{
                const ex = sj.pillarStars(du.s,du.b).slice(1);
                const ft = fateOf(sj, du.s, du.b);
                const ftl = ft.includes("용신이") ? {l:"✦ 용신운",c:" gold"} :
                            ft.includes("희신") ? {l:"✦ 희신운",c:" gold"} :
                            ft.includes("치는") ? {l:"기신 경계",c:""} : null;
                return (
                <button key={i}
                  className={"mg-du"+(sj.curDaeun===du?" cur":"")+(selDu===i?" sel":"")}
                  onClick={()=>setSelDu(selDu===i?null:i)}>
                  {sj.curDaeun===du && <span className="mg-now">現在</span>}
                  {du.start}세~
                  <span className="h">
                    <span style={{color:ELC[SE[du.s]]}}>{SH[du.s]}</span>
                    <span style={{color:ELC[BE[du.b]]}}>{BH[du.b]}</span>
                  </span>
                  {S[du.s]}{B[du.b]}
                  <span className="mg-dusin">{sj.sinsal(du.b)}<b>{"●".repeat(SINSAL_INFO[sj.sinsal(du.b)].p)}</b></span>
                  {ftl && <span className={"mg-duex"+ftl.c}>{ftl.l}</span>}
                  {ex.map(st=>(
                    <span key={st} className={"mg-duex"+(DICT[st].t==="길신"?" gold":"")}>{st}</span>))}
                </button>
              );})}
            </div>

            {selDu!=null && (()=>{ const du=sj.daeun[selDu]; return (
              <div className="mg-card mg-dudetail mg-stage">
                <div className="duhead">
                  <span className="duhan">
                    <span style={{color:ELC[SE[du.s]]}}>{SH[du.s]}</span>
                    <span style={{color:ELC[BE[du.b]]}}>{BH[du.b]}</span>
                  </span>
                  <span className="duage">{du.start}~{du.end}세 대운{sj.curDaeun===du?" · 지금 지나는 계절":""}</span>
                </div>
                <div className="mg-chips">
                  <button className="mg-chip" onClick={()=>setSheet(tenGod(sj.pillars.ds,du.s))}>
                    천간 {S[du.s]} · {tenGod(sj.pillars.ds,du.s)}</button>
                  <button className="mg-chip" onClick={()=>setSheet(tenGod(sj.pillars.ds,BM[du.b]))}>
                    지지 {B[du.b]} · {tenGod(sj.pillars.ds,BM[du.b])}</button>
                  {sj.pillarStars(du.s,du.b).map(st=>(
                    <button key={st} className={"mg-chip "+(DICT[st].t==="길신"?"gold":"red")}
                      onClick={()=>setSheet(st)}>
                      {st} {"●".repeat(DICT[st].p||1)}{"○".repeat(3-(DICT[st].p||1))}</button>))}
                  {sj.yong.el &&
                    <button className={"mg-chip "+(fateOf(sj,du.s,du.b).includes("치는")?"red":fateOf(sj,du.s,du.b).includes("무관")?"rel":"gold")}
                      onClick={()=>setSheet("용신")}>{fateOf(sj, du.s, du.b)}</button>}
                </div>
                {duText[selDu]
                  ? (()=>{ const { main, easy } = splitEasy(duText[selDu]); return (<>
                      <p style={{fontSize:15.5,lineHeight:1.95,margin:"14px 0 0",whiteSpace:"pre-wrap",wordBreak:"keep-all"}}>
                        <T text={main} /></p>
                      {easy && <div className="mg-easy"><span className="lab">쉽게 말하면</span>{easy}</div>}
                    </>); })()
                  : <div className="mg-err">이 대운의 풀이가 비어 있다.
                      <button className="mg-retry" onClick={()=>loadAll(sj,[selDu<4?"da":"db"],form)}>다시 읽는다</button></div>}
              </div>
            ); })()}
            <div style={{fontSize:12,color:"#8d8294",textAlign:"center"}}>
              {CUR_YEAR} 丙午년 세운 · {sj.cheonEul.length?`천을귀인 ${sj.cheonEul.join("·")}`:"천을귀인 없음"} · 대운 {sj.forward?"순행":"역행"}
            </div>

            <div className="mg-tabs">
              <button className={"mg-tab"+(tab==="life"?" on":"")} onClick={()=>switchTab("life")}>인생행로</button>
              <button className={"mg-tab"+(tab==="fortune"?" on":"")} onClick={()=>switchTab("fortune")}>丙午년 운세</button>
              <button className={"mg-tab"+(tab==="health"?" on":"")} onClick={()=>switchTab("health")}>건강행로</button>
            </div>

            {tab==="life" && life && <>
              <Stage hanja="少" name="청소년기 · 1~19세" text={life["청소년기"]} />
              <Stage hanja="靑" name="청년기 · 20~39세" text={life["청년기"]} />
              <Stage hanja="中" name="중년기 · 40~59세" text={life["중년기"]} />
              <Stage hanja="老" name="노년기 · 60세 이후" text={life["노년기"]} />
            </>}

            {tab==="fortune" && fortune && <>
              <Stage hanja="財" name="금전운" text={fortune["금전운"]} />
              <Stage hanja="緣" name="연애운" text={fortune["연애운"]} />
              <Stage hanja="業" name="사업운" text={fortune["사업운"]} />
              <Stage hanja="官" name="직장·명예운" text={fortune["직장·명예운"]} />
              <Stage hanja="人" name="대인관계운" text={fortune["대인관계운"]} />
              <Stage hanja="身" name="건강운" text={fortune["건강운"]} />
            </>}

            {tab==="health" && health && <>
              <Stage hanja="臟" name="타고난 약처" text={health["타고난 약처"]} />
              <Stage hanja="時" name="조심할 시기" text={health["조심할 시기"]} />
              <Stage hanja="禳" name="액막이 처방" text={health["액막이"]} />
            </>}

            <div className="mg-savebar">
              <button className="mg-tbtn" onClick={saveTxt}>풀이 전체 .txt 저장</button>
              <button className="mg-tbtn" onClick={savePng} disabled={saving}>{saving ? "이미지 만드는 중…" : "지금 화면 .png 저장"}</button>
            </div>
            <button className="mg-back" onClick={()=>setStep("input")}>← 다른 사주 보기</button>
          </div>
        )}

        <div className="mg-foot">
          절입 시각·진태양시를 반영한 정밀 명식 기준.<br/>
          고전 명리 해석 전통에 따른 직설 풀이로, 예언이 아닌 참고용이다.<br/>건강 대목은 오행 전통 해석이며 의학적 진단·치료가 아니다. 실제 증상은 병원 진료가 우선이다.
        </div>
      </div>

      {sheet && DICT[sheet] && (
        <div className="mg-sheetov" onClick={()=>setSheet(null)}>
          <div className="mg-sheet" onClick={e=>e.stopPropagation()}>
            <h3>{sheet}
              {DICT[sheet].t && <span className={"tag "+DICT[sheet].t}>{DICT[sheet].t}</span>}
            </h3>
            {DICT[sheet].p &&
              <div className="mg-pow">기운의 강도
                <span className="dots">{"●".repeat(DICT[sheet].p)}{"○".repeat(3-DICT[sheet].p)}</span>
                <span style={{marginLeft:6}}>{["","은근함","뚜렷함","강렬함"][DICT[sheet].p]}</span>
              </div>}
            <p>{DICT[sheet].d}</p>
            <button className="close" onClick={()=>setSheet(null)}>닫기</button>
          </div>
        </div>
      )}
    </div>
  );
}
