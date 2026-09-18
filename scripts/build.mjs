import { readFile, readdir, mkdir, writeFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { fileURLToPath } from 'node:url';
import { join } from 'node:path';

const root=fileURLToPath(new URL('../',import.meta.url));
const names=['index.html','style.css','favicon.svg',...(await readdir(join(root,'src'))).filter(p=>p.endsWith('.js')).sort().map(p=>`src/${p}`)];
const files=await Promise.all(names.map(async path=>({path,content:await readFile(join(root,path),'utf8')})));
const version=createHash('sha256').update(files.map(f=>f.path+'\n'+f.content).join('\n')).digest('hex').slice(0,12);
await mkdir(join(root,'_site','src'),{recursive:true});
for(const file of files) {
  let content=file.content;
  if(file.path.endsWith('.js')) content=content.replace(/(from\s*['"])(\.\.?\/[^'"?]+\.js)(['"])/g,`$1$2?v=${version}$3`);
  if(file.path==='index.html') content=content.replace(/((?:href|src)=["'])(\.\/(?:style\.css|favicon\.svg|src\/game\.js))(["'])/g,`$1$2?v=${version}$3`);
  await writeFile(join(root,'_site',file.path),content);
}
await writeFile(join(root,'_site','.nojekyll'),'');
await writeFile(join(root,'_site','version.json'),JSON.stringify({version}));
console.log(`Built ${files.length} static files · version ${version}`);
