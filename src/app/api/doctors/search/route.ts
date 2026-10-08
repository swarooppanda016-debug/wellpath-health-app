import { NextRequest, NextResponse } from 'next/server';

const specialtyMap: Record<string,string[]> = {
  diabetes:['Diabetologist','Endocrinologist','Internal Medicine'],
  hypertension:['Cardiologist','Internal Medicine'],
  heart:['Cardiologist'],
  stroke:['Neurologist','Cardiologist'],
  asthma:['Pulmonologist','Allergist'],
  copd:['Pulmonologist'],
  epilepsy:['Neurologist'],
  parkinson:['Neurologist'],
  dementia:['Neurologist','Geriatrician'],
  multiple_sclerosis:['Neurologist'],
  kidney:['Nephrologist'],
  urinary:['Urologist','Nephrologist'],
  osteoarthritis:['Orthopedic Doctor','Rheumatologist'],
  arthritis:['Rheumatologist','Orthopedic Doctor'],
  osteoporosis:['Orthopedic Doctor','Rheumatologist'],
  back:['Orthopedic Doctor','Physiatrist'],
  thyroid:['Endocrinologist'],
  pcos:['Gynecologist','Endocrinologist'],
  endometriosis:['Gynecologist'],
  pregnancy:['Obstetrician Gynecologist'],
  menopause:['Gynecologist'],
  obesity:['Endocrinologist','Internal Medicine'],
  liver:['Hepatologist','Gastroenterologist'],
  hepatitis:['Hepatologist','Gastroenterologist'],
  ibs:['Gastroenterologist'],
  ibd:['Gastroenterologist'],
  constipation:['Gastroenterologist'],
  reflux:['Gastroenterologist'],
  migraine:['Neurologist'],
  anemia:['Hematologist','Internal Medicine'],
  sickle:['Hematologist'],
  allergy:['Allergist'],
  eczema:['Dermatologist'],
  psoriasis:['Dermatologist'],
  acne:['Dermatologist'],
  cancer:['Oncologist'],
  sleep:['Sleep Medicine Specialist','Pulmonologist'],
  gout:['Rheumatologist'],
  cholesterol:['Cardiologist','Internal Medicine'],
  tb:['Pulmonologist','Infectious Disease Specialist'],
  influenza:['General Physician','Internal Medicine'],
  covid:['General Physician','Internal Medicine'],
  dengue:['Internal Medicine','Infectious Disease Specialist'],
  malaria:['Internal Medicine','Infectious Disease Specialist'],
  hiv:['Infectious Disease Specialist'],
  anxiety:['Psychiatrist','Clinical Psychologist'],
  depression:['Psychiatrist','Clinical Psychologist'],
  bipolar:['Psychiatrist'],
  adhd:['Psychiatrist'],
  autism:['Psychiatrist','Developmental Pediatrician'],
};

function specialtiesFor(names:string[]) {
  const found:string[]=[];
  for (const raw of names) {
    const n=raw.toLowerCase();
    for (const [key,values] of Object.entries(specialtyMap)) {
      if (n.includes(key)) values.forEach(v=>{if(!found.includes(v)) found.push(v)});
    }
  }
  if (!found.length) found.push('General Physician','Internal Medicine');
  return found.slice(0,4);
}

async function geocode(address:string,pin:string,key:string) {
  const q=encodeURIComponent([address,pin,'India'].filter(Boolean).join(', '));
  const r=await fetch(`https://maps.googleapis.com/maps/api/geocode/json?address=${q}&key=${encodeURIComponent(key)}`,{cache:'no-store'});
  if(!r.ok) throw new Error('Location lookup failed');
  const data=await r.json();
  if(data.status!=='OK' || !data.results?.[0]) return null;
  const result=data.results[0];
  return {lat:result.geometry.location.lat,lng:result.geometry.location.lng,formatted:result.formatted_address};
}

async function searchPlaces(query:string,lat:number,lng:number,key:string) {
  const r=await fetch('https://places.googleapis.com/v1/places:searchText',{
    method:'POST',
    headers:{'Content-Type':'application/json','X-Goog-Api-Key':key,'X-Goog-FieldMask':'places.id,places.displayName,places.formattedAddress,places.nationalPhoneNumber,places.websiteUri,places.googleMapsUri,places.rating,places.userRatingCount,places.location'},
    body:JSON.stringify({textQuery:`${query} near ${lat}, ${lng}, India`,pageSize:8,rankPreference:'DISTANCE',locationBias:{circle:{center:{latitude:lat,longitude:lng},radius:10000}}}),
    cache:'no-store'
  });
  if(!r.ok) throw new Error('Doctor search failed');
  const data=await r.json();
  return (data.places||[]).map((p:any)=>({
    id:p.id,name:p.displayName?.text||'Healthcare provider',address:p.formattedAddress||'',phone:p.nationalPhoneNumber||'',website:p.websiteUri||'',maps:p.googleMapsUri||'',rating:p.rating||null,reviews:p.userRatingCount||0,location:p.location||null,specialty:query
  }));
}

export async function POST(req:NextRequest) {
  const key=process.env.GOOGLE_MAPS_API_KEY;
  if(!key) return NextResponse.json({error:'Doctor search is not configured yet. Add GOOGLE_MAPS_API_KEY in Vercel environment variables.'},{status:503});
  try {
    const body=await req.json();
    const address=String(body.address||'').trim();
    const pin=String(body.pin||'').trim();
    const diseases=Array.isArray(body.diseases)?body.diseases.map(String):[];
    if(!pin || !/^\d{6}$/.test(pin)) return NextResponse.json({error:'Enter a valid 6-digit Indian PIN code.'},{status:400});
    if(!address) return NextResponse.json({error:'Enter the locality/address to search around.'},{status:400});
    const geo=await geocode(address,pin,key);
    if(!geo) return NextResponse.json({error:'We could not locate that address and PIN. Try a nearby landmark or locality.'},{status:404});
    const specialties=specialtiesFor(diseases);
    const batches=await Promise.all(specialties.map(s=>searchPlaces(s,geo.lat,geo.lng,key)));
    const seen=new Set<string>();
    const doctors=batches.flat().filter(d=>{if(seen.has(d.id))return false;seen.add(d.id);return true}).slice(0,20);
    return NextResponse.json({location:geo.formatted,specialties,doctors});
  } catch(e:any) {
    return NextResponse.json({error:e?.message||'Unable to search doctors right now.'},{status:500});
  }
}
