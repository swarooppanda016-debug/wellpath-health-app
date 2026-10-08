import { NextRequest, NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

async function getToken() {
  const id = process.env.WHO_ICD_CLIENT_ID
  const secret = process.env.WHO_ICD_CLIENT_SECRET
  if (!id || !secret) return null
  const basic = Buffer.from(`${id}:${secret}`).toString('base64')
  const res = await fetch('https://icdaccessmanagement.who.int/connect/token', {
    method:'POST',
    headers:{'Authorization':`Basic ${basic}`,'Content-Type':'application/x-www-form-urlencoded'},
    body:'grant_type=client_credentials&scope=icdapi_access',
    cache:'no-store'
  })
  if (!res.ok) throw new Error(`WHO token request failed: ${res.status}`)
  const json = await res.json()
  return json.access_token as string
}

export async function GET(req:NextRequest){
  const q=(req.nextUrl.searchParams.get('q')||'').trim()
  const language=(req.nextUrl.searchParams.get('lang')||'en').trim()
  if(q.length<2) return NextResponse.json({results:[],configured:Boolean(process.env.WHO_ICD_CLIENT_ID&&process.env.WHO_ICD_CLIENT_SECRET),message:'Enter at least 2 characters.'})
  try{
    const token=await getToken()
    if(!token) return NextResponse.json({results:[],configured:false,message:'WHO ICD API credentials are not configured.'})
    const url=`https://id.who.int/icd/entity/search?q=${encodeURIComponent(q)}&useFlexisearch=true`
    const res=await fetch(url,{headers:{Authorization:`Bearer ${token}`,'API-Version':'v2','Accept':'application/json','Accept-Language':language},cache:'no-store'})
    if(!res.ok) throw new Error(`WHO search failed: ${res.status}`)
    const data=await res.json()
    const entities=Array.isArray(data?.DestinationEntities)?data.DestinationEntities:[]
    const results=entities.slice(0,20).map((x:any)=>({
      id:x.Id,title:x.Title,code:x.TheCode||'',chapter:x.Chapter||'',score:x.Score||0,
      uri:x.Id
    }))
    return NextResponse.json({results,configured:true,error:Boolean(data?.Error),message:data?.ErrorMessage||null})
  }catch(e:any){
    return NextResponse.json({results:[],configured:true,message:e?.message||'WHO ICD search failed.'},{status:502})
  }
}
