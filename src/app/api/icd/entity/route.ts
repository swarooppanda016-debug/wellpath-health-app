import { NextRequest, NextResponse } from 'next/server'
export const dynamic='force-dynamic'
async function getToken(){
 const id=process.env.WHO_ICD_CLIENT_ID, secret=process.env.WHO_ICD_CLIENT_SECRET
 if(!id||!secret) return null
 const basic=Buffer.from(`${id}:${secret}`).toString('base64')
 const r=await fetch('https://icdaccessmanagement.who.int/connect/token',{method:'POST',headers:{Authorization:`Basic ${basic}`,'Content-Type':'application/x-www-form-urlencoded'},body:'grant_type=client_credentials&scope=icdapi_access',cache:'no-store'})
 if(!r.ok) throw new Error(`WHO token request failed: ${r.status}`)
 return (await r.json()).access_token as string
}
export async function GET(req:NextRequest){
 const uri=req.nextUrl.searchParams.get('uri')||''
 if(!uri.startsWith('http://id.who.int/icd/')) return NextResponse.json({message:'Invalid WHO ICD entity URI.'},{status:400})
 try{
  const token=await getToken(); if(!token) return NextResponse.json({configured:false,message:'WHO ICD API credentials are not configured.'})
  const target=uri.replace(/^http:\/\//,'https://')
  const r=await fetch(target,{headers:{Authorization:`Bearer ${token}`,'API-Version':'v2','Accept':'application/json','Accept-Language':'en'},cache:'no-store'})
  if(!r.ok) throw new Error(`WHO entity request failed: ${r.status}`)
  return NextResponse.json({configured:true,data:await r.json()})
 }catch(e:any){return NextResponse.json({configured:true,message:e?.message||'WHO ICD entity lookup failed.'},{status:502})}
}
