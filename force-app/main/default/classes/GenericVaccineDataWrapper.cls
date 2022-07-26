/**
 * @description GenericVaccineDataWrapper class is a common Wrapper to flatten the response from multiple endpoints for the LWC component
 *
 * @author      Salesforce Binge
 * @website     https://salesforcebinge.com/
 */
public without sharing class GenericVaccineDataWrapper {

    @AuraEnabled public String fee_type{get;set;}
    @AuraEnabled public Integer pincode{get;set;}
    @AuraEnabled public String block_name{get;set;}
    @AuraEnabled public String district_name{get;set;}
    @AuraEnabled public String from_x{get;set;}
    @AuraEnabled public String state_name{get;set;}
    @AuraEnabled public String to{get;set;}
    @AuraEnabled public String address{get;set;}
    @AuraEnabled public String name{get;set;}
    @AuraEnabled public Integer center_id{get;set;}
    @AuraEnabled public String vaccine{get;set;}//
    @AuraEnabled public Integer min_age_limit{get;set;}
    @AuraEnabled public Integer available_capacity_dose1{get;set;}
    @AuraEnabled public Integer available_capacity{get;set;}
    @AuraEnabled public Integer available_capacity_dose2{get;set;}
    @AuraEnabled public String date_x{get;set;}
    @AuraEnabled public String session_id{get;set;}
    
    public GenericVaccineDataWrapper() {}
}