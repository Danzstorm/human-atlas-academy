import {fileURLToPath} from 'node:url';
import {defineConfig,loadEnv} from 'vite';
import {readFileSync} from 'node:fs';
import {createTutorService,tutorMiddleware} from './server/tutor.mjs';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/postcss';
const path=(relative:string)=>fileURLToPath(new URL(relative,import.meta.url));
export default defineConfig({root:path('./web'),publicDir:path('./public'),plugins:[react(),{name:'local-anatomy-tutor',configureServer(server){const service=createTutorService({atlas:JSON.parse(readFileSync(path('./public/models/atlas.json'),'utf8')),credentials:()=>{const env=loadEnv('development',path('./'),'');return {key:env.OPENAI_API_KEY,model:env.OPENAI_MODEL||'gpt-4.1-mini'};}});server.middlewares.use(tutorMiddleware(service));}}],resolve:{alias:{'@':path('./')}},css:{postcss:{plugins:[tailwindcss()]}},server:{host:'127.0.0.1',port:3016,strictPort:true,watch:{usePolling:true}},build:{outDir:path('./dist'),emptyOutDir:true}});
