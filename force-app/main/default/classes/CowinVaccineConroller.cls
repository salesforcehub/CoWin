/**
 * @description CowinVaccineConroller class is the controller for the LWC component
 * 
 * @author      Salesforce Binge
 * @website     https://salesforcebinge.com/
 */
public without sharing class CowinVaccineConroller {
    
    @AuraEnabled(cacheable=true)
    public static List<CowinVaccine__c> getVaccineDistricts() {
        return [SELECT Id, State__c, District__c, District_Id__c
                FROM CowinVaccine__c 
                ORDER BY District__c ASC
                LIMIT 1000];
    }

    @AuraEnabled(cacheable=true)
    public static List<CowinVaccine__c> findDistricts(String searchKey) {
        String key = '%' + searchKey + '%';
        return [
            SELECT Id, State__c, District__c, District_Id__c
            FROM CowinVaccine__c
            WHERE District__c LIKE :key
            ORDER BY District__c ASC
            //WITH SECURITY_ENFORCED
            LIMIT 1000
        ];
    }

    @AuraEnabled
    public static List<GenericVaccineDataWrapper> calendarByDistrict (String districtId, String vaccDate) {
        List<CalendarByDistrictResponse.Center> vaccineSessions = new List<CalendarByDistrictResponse.Center>();
        List<GenericVaccineDataWrapper> vaccineWrapperList = new List<GenericVaccineDataWrapper>();

        String url = 'https://cdn-api.co-vin.in/api/v2/appointment/sessions/public/calendarByDistrict?district_id='+districtId+'&date='+vaccDate;
        HttpResponse response = CowinVaccineRequest.coWinVaccineGetCall(url);

        if (response.getStatusCode() == 200) {
            String responseBodyDate = response.getBody().replaceAll('\"date\":', '\"date_x\":');
            String responseBodyDateLong = responseBodyDate.replaceAll('\"long\":', '\"long_x\":');
            String responseBody = responseBodyDateLong.replaceAll('\"from\":', '\"from_x\":');
            CalendarByDistrictResponse sessionResponse = (CalendarByDistrictResponse)JSON.deserialize(responseBody, CalendarByDistrictResponse.class);

            for (CalendarByDistrictResponse.Center vaccineCenter : sessionResponse.centers) {
                if (! vaccineCenter.sessions.isEmpty()) {
                    for (CalendarByDistrictResponse.Session vaccineSession : vaccineCenter.sessions) {
                        GenericVaccineDataWrapper vaccineWrapper = new GenericVaccineDataWrapper ();
                        vaccineWrapper.name = vaccineCenter.name;
                        vaccineWrapper.address = vaccineCenter.address;
                        vaccineWrapper.block_name = vaccineCenter.block_name;
                        vaccineWrapper.fee_type = vaccineCenter.fee_type;
                        vaccineWrapper.state_name = vaccineCenter.state_name;
                        vaccineWrapper.district_name = vaccineCenter.district_name;
                        vaccineWrapper.vaccine = vaccineSession.vaccine;
                        vaccineWrapper.min_age_limit = vaccineSession.min_age_limit;
                        vaccineWrapper.available_capacity = vaccineSession.available_capacity;
                        vaccineWrapper.date_x = vaccineSession.date_x;
                        vaccineWrapper.pincode = vaccineCenter.pincode;
                        vaccineWrapperList.add(vaccineWrapper);
                    }
                }
            }
        }
        return vaccineWrapperList;
    }

    @AuraEnabled
    public static List<GenericVaccineDataWrapper> calendarByPin (String pincode, String vaccDate) {
        List<GenericVaccineDataWrapper> vaccineWrapperList = new List<GenericVaccineDataWrapper>();
        List<CalendarByPinResponse.Center> vaccineSessions = new List<CalendarByPinResponse.Center>();

        String url = 'https://cdn-api.co-vin.in/api/v2/appointment/sessions/public/calendarByPin?pincode='+pincode+'&date='+vaccDate;
        HttpResponse response = CowinVaccineRequest.coWinVaccineGetCall(url);

        if (response.getStatusCode() == 200) {
            String responseBodyDate = response.getBody().replaceAll('\"date\":', '\"date_x\":');
            String responseBodyDateLong = responseBodyDate.replaceAll('\"long\":', '\"long_x\":');
            String responseBody = responseBodyDateLong.replaceAll('\"from\":', '\"from_x\":');
            CalendarByPinResponse sessionResponse = (CalendarByPinResponse)JSON.deserialize(responseBody, CalendarByPinResponse.class);

            for (CalendarByPinResponse.Center vaccineCenter : sessionResponse.centers) {
                if (! vaccineCenter.sessions.isEmpty()) {
                    for (CalendarByPinResponse.Session vaccineSession : vaccineCenter.sessions) {
                        GenericVaccineDataWrapper vaccineWrapper = new GenericVaccineDataWrapper ();
                        vaccineWrapper.name = vaccineCenter.name;
                        vaccineWrapper.address = vaccineCenter.address;
                        vaccineWrapper.block_name = vaccineCenter.block_name;
                        vaccineWrapper.fee_type = vaccineCenter.fee_type;
                        vaccineWrapper.state_name = vaccineCenter.state_name;
                        vaccineWrapper.district_name = vaccineCenter.district_name;
                        vaccineWrapper.vaccine = vaccineSession.vaccine;
                        vaccineWrapper.min_age_limit = vaccineSession.min_age_limit;
                        vaccineWrapper.available_capacity = vaccineSession.available_capacity;
                        vaccineWrapper.date_x = vaccineSession.date_x;
                        vaccineWrapper.pincode = vaccineCenter.pincode;
                        vaccineWrapperList.add(vaccineWrapper);
                    }
                }
            }
        }
        return vaccineWrapperList;
    }
}