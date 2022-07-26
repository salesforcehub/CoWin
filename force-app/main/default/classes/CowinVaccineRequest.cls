/**
 * @description CowinVaccineRequest class is used to make a callout to COWIN APIs
 * 
 * @author      Salesforce Binge
 * @website     https://salesforcebinge.com/
 */
global class CowinVaccineRequest {
    
    global static HttpResponse coWinVaccineGetCall(String url){
        HttpRequest req = new HttpRequest();
        req.setTimeout(30000);
        req.setEndpoint(url);
        req.setHeader('Accept-Language','hi_IN');
        req.setHeader('Accept','application/json');
        req.setHeader('Content-Type', 'application/json;charset=UTF-8');
        req.setHeader('User-Agent','Mozilla/5.0 (Macintosh; Intel Mac OS X 10_10_1) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/39.0.2171.95 Safari/537.36');
        req.setMethod('GET');

        Http http = new Http();
        HttpResponse response =  http.send(req); 
        return response;
    }
}