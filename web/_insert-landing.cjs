const fs=require('fs');
const SCR=process.env.SCR;
const LANGS=["af","bn","da","fil","hu","ko","sw","th","vi","zh-CN","zh-TW"];
const data={};
for(const l of LANGS) data[l]=JSON.parse(fs.readFileSync(`${SCR}/landing-${l}.json`,'utf8'));
function findCopyClose(src){
  const decl=src.indexOf("const COPY");
  const open=src.indexOf("{", decl);
  let i=open+1, depth=1, s=null, esc=false;
  for(; i<src.length; i++){ const c=src[i];
    if(s){ if(esc){esc=false;continue;} if(c==='\'){esc=true;continue;} if(c===s)s=null; continue; }
    if(c==='"'||c==="'"||c==='`'){s=c;continue;}
    if(c==='{')depth++; else if(c==='}'){depth--; if(depth===0)return i;}
  }
  return -1;
}
function insert(file,key,typeName){
  let src=fs.readFileSync(file,'utf8');
  const close=findCopyClose(src);
  if(close<0){console.error("NO CLOSE "+file);process.exit(1);}
  const entries=LANGS.map(l=>`  ${JSON.stringify(l)}: ${JSON.stringify(data[l][key])}`).join(",\n");
  const snippet=`\n\n// 11 store-locale languages (af/bn/da/fil/hu/ko/sw/th/vi/zh-CN/zh-TW), added 2026-08-22\n// so the landing copy is native instead of English fallback. satisfies-guarded.\nObject.assign(COPY, {\n${entries}\n} satisfies Record<string, ${typeName}>);\n`;
  let at=close+1; if(src[at]===';')at++;
  src=src.slice(0,at)+snippet+src.slice(at);
  fs.writeFileSync(file,src);
  console.log(file+" ✓ inserted "+LANGS.length+" langs at idx "+at);
}
insert("src/app/families/FamiliesLandingClient.tsx","famCopy","Copy");
insert("src/app/schools/SchoolsLandingClient.tsx","schCopy","T");
