const fs =require('fs');

const https = require('https')
const options = {
  hostname: 'https://pomber.github.io',
  port: 443,
  path: '/covid19/timeseries.json',
  method: 'GET'
}
//https://pomber.github.io/covid19/timeseries.json





const proces=()=>{
	
let data=JSON.parse(fs.readFileSync("timeseries.json"));
let popdata=JSON.parse(fs.readFileSync("world_population_density.json"));
let datatowrite=[];
let presets={};
presets.China=30;
presets.Japan=7;
presets.Thailand=9;
for(let country in data){
    let dataCun=data[country];
    let confirmed_lastcount=0;
    let deaths_lastcount=0;
    let recovered_lastcount=0;
    let days_count_since_first_incident=0;
    let date_count_start=false;
    let final_country_data=[];
    dataCun.forEach(con => {
        if(con.confirmed){
            date_count_start=true;
        }
        if(date_count_start){
            if(days_count_since_first_incident==0 && presets[country]){
                days_count_since_first_incident=presets[country];
            }
            days_count_since_first_incident+=1;
            
        }
        con.country=country;
        con.population_density=popdata[country] && popdata[country].population_density;
        con.added_confirmed=con.confirmed-confirmed_lastcount;
        con.added_deaths=con.deaths-deaths_lastcount;
        con.added_recovered=con.recovered-recovered_lastcount;
        final_country_data.push(con);
        confirmed_lastcount=con.confirmed;
        deaths_lastcount=con.deaths;
        recovered_lastcount=con.recovered;

    });
    final_country_data.forEach((x)=>{
        x.days_count_since_first_incident=days_count_since_first_incident;
        datatowrite.push(x);
    })
}
fs.writeFileSync("updated.json",JSON.stringify(datatowrite));
}



https.get('https://pomber.github.io/covid19/timeseries.json', (resp) => {
  let data = '';

  // A chunk of data has been recieved.
  resp.on('data', (chunk) => {
    data += chunk;
  });

  // The whole response has been received. Print out the result.
  resp.on('end', () => {
    fs.writeFileSync("timeseries.json",data)
	proces();
  });

}).on("error", (err) => {
  console.log("Error: " + err.message);
});