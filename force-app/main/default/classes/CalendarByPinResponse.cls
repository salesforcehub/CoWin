/**
 * @description CalendarByPinResponse class is the JSON container for COWIN - CalendarByPin API response
 * 
 * @author      Salesforce Binge
 * @website     https://salesforcebinge.com/
 */
public without sharing class CalendarByPinResponse {
	
    public List<Center> centers{get;set;}
	
    public class Vaccine{
		@AuraEnabled public String fee{get;set;}
		@AuraEnabled public String vaccine{get;set;}
	}

	public class Session{
		@AuraEnabled public String session_id{get;set;}
		@AuraEnabled public list<String> slots{get;set;}
		@AuraEnabled public String vaccine{get;set;}
		@AuraEnabled public Integer available_capacity_dose1{get;set;}
		@AuraEnabled public Integer min_age_limit{get;set;}
		@AuraEnabled public Integer available_capacity_dose2{get;set;}
		@AuraEnabled public Integer available_capacity{get;set;}
		@AuraEnabled public String date_x{get;set;}
	}
	public class Center{
		@AuraEnabled public String fee_type{get;set;}
		@AuraEnabled public Integer pincode{get;set;}
		@AuraEnabled public Integer lat{get;set;}
		@AuraEnabled public String block_name{get;set;}
		@AuraEnabled public Integer long_x{get;set;}
		@AuraEnabled public String district_name{get;set;}
		@AuraEnabled public String from_x{get;set;}
		@AuraEnabled public String state_name{get;set;}
		@AuraEnabled public String to{get;set;}
		@AuraEnabled public String address{get;set;}
		@AuraEnabled public List<Session> sessions{get;set;}
		@AuraEnabled public String name{get;set;}
		@AuraEnabled public List<Vaccine> vaccine_fees{get;set;}
		@AuraEnabled public Integer center_id{get;set;}
	}
}