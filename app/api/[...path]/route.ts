import {env} from 'cloudflare:workers';
import {handleApi} from '../../../lib/server';
export const dynamic='force-dynamic';
export const GET=(request:Request)=>handleApi(request,env);
export const POST=(request:Request)=>handleApi(request,env);
export const PATCH=(request:Request)=>handleApi(request,env);
export const DELETE=(request:Request)=>handleApi(request,env);
