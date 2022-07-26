import { LightningElement, wire } from 'lwc';
import { loadStyle } from 'lightning/platformResourceLoader';
import cowinVaccineCss from '@salesforce/resourceUrl/cowinVaccine';
import { NavigationMixin } from "lightning/navigation";
import getVaccineDistricts from '@salesforce/apex/CowinVaccineConroller.getVaccineDistricts';
import calendarByDistrict from '@salesforce/apex/CowinVaccineConroller.calendarByDistrict';
import calendarByPin from '@salesforce/apex/CowinVaccineConroller.calendarByPin';

const sessionColumns = [
    { label: 'Earliest Date', fieldName: 'date_x', editable: false },
    { label: 'Available Slots', fieldName: 'available_capacity', editable: false, 
        cellAttributes:{
            class:{ fieldName:'slotColor' },
            iconName:{ fieldName:'slotIcon' }, 
            iconPosition:'right'
        }
    },
    { label: 'Vaccine', fieldName: 'vaccine', editable: false, 
        cellAttributes:{
            class:{ fieldName:'vaccineColor' }
        }
    },
    { label: 'Minimum Age', fieldName: 'min_age_limit', editable: false,
        cellAttributes:{
            class:{ fieldName:'ageColor' }
        }
    },
    { label: 'Pincode', fieldName: 'pincode', editable: false },
    { label: 'Center Name', fieldName: 'name', editable: false, wrapText: true },
    { label: 'State', fieldName: 'state_name', editable: false },
    { label: 'District', fieldName: 'district_name', editable: false },
    { label: 'Block', fieldName: 'block_name', editable: false },
    { label: 'Fee', fieldName: 'fee_type', editable: false },
    { label: '', type: 'button', initialWidth: 120,
        typeAttributes: {
            label: 'Book Now',
            title: 'Book Appointment',
            variant: 'destructive',
            size:'large',
            iconPosition: 'center',
            disabled:{fieldName:'turnOff'}
        }
    }
];

export default class CowinVaccine extends NavigationMixin (LightningElement) {
    @wire(getVaccineDistricts) vaccineDistricts;
    searchKey = '';
    vaccDistricts = [];
    selectedDistrict;
    chosenDate;
    selectedDate = '02-08-2021';
    selectedPin;
    sessionColumns = sessionColumns;
    noDataToDisplay = false;
    noPinSlotsToDisplay = false;
    sessionsAvailable;
    pinSessionsAvailable;
    slotMsg = 'Unfortunately, there are no slots available. Please check back later.';
    filterMsg = 'There are no results for your search. Please check back later.';
    error;
    allVaccineCenters = [];
    activeTab = '1';
    isLoading = false;
    showFilters = false;
    data=[];
    noFilteredDataToDisplay;
    page = 1; 
    items = [];
    startingRecord = 1;
    endingRecord = 0; 
    pageSize = 8; 
    totalRecountCount = 0;
    totalPage = 0;

    connectedCallback() {
        this.data = [...this.allVaccineCenters];
    }

    updateSearch(event) {
        var regex = new RegExp(event.target.value,'gi')
        this.items = this.allVaccineCenters.filter(
            row => regex.test(row.name)
        );
        this.totalRecountCount = this.items.length; 
        this.totalPage = Math.ceil(this.totalRecountCount / this.pageSize); 
        this.data = this.items.slice(0,this.pageSize); 
        this.endingRecord = this.pageSize;
    }

    renderedCallback() {
        Promise.all([
            loadStyle( this, cowinVaccineCss )
            ]).then(() => {
                //console.log( 'Files loaded' );
            })
            .catch(error => {
                //console.log( error.body.message );
        });
    }

    handleActive(event) {
        this.activeTab = event.target.value;
        this.resetAll();
    }

    handleKeyChange(event) {
        var results = [];
        this.searchKey = event.target.value;
        var searchTxt = this.searchKey.replace(/[-\[\]\/\{\}\(\)\*\+\?\.\\\^\$\|]/g, '\\$&');
        var matcher = new RegExp(searchTxt, 'i');
        for(var i=0;i<this.vaccineDistricts.data.length;i++){
            if(this.vaccineDistricts.data[i].District__c.match(matcher) ||
              (this.vaccineDistricts.data[i].District__c && this.vaccineDistricts.data[i].District__c.match(matcher))){
			    results.push(this.vaccineDistricts.data[i]);            
			}
        }

        if (results.length > 0){
            this.vaccDistricts = results;
        } else if (results.length === 0  && this.searchKey !='') {
            this.vaccDistricts = [];
        } else {
            this.vaccDistricts = this.vaccineDistricts.data;
        }
    }

    selectionChangeHandler(event) {
        console.log(event.currentTarget.getAttribute('data-id'));
        console.log(event.currentTarget.getAttribute('data-name'));
        this.selectedDistrict = event.currentTarget.getAttribute('data-id');
        this.vaccDistricts = [];
        this.searchKey = event.currentTarget.getAttribute('data-name');
	}

    getRowActions(row, doneCallback){
        if(row.available_capacity > 0) {
            doneCallback([{ label: 'Book Appointment', name: 'bookSlot' }]);
          }
    }

    handleRowAction(event) {
        const actionName = event.detail.action.name;
        const row = event.detail.row;
        var url= 'https://selfregistration.cowin.gov.in/';
        window.open(url, '_blank').focus();
    }

    handleDateChange (event) {
        this.chosenDate = event.target.value;

        var dateString = this.chosenDate.toString();
        var p = dateString.split(/\D/g)
        this.selectedDate = [p[2],p[1],p[0] ].join("-");
    }

    handlePincodeChange (event) {
        this.selectedPin = event.target.value;
    }

    handleCalendarByDistrict() {
        this.data = [];
        this.allVaccineCenters = [];
        this.isLoading = true;
        let params = {};
        params.districtId = this.selectedDistrict;
        params.vaccDate = this.selectedDate;

        calendarByDistrict(params)
            .then((result) => {
                this.addColor(result);
                this.noDataToDisplay = false;
                this.isLoading = false;
                this.sessionsAvailable = true;
            })
            .catch((error) => {
                this.error = error;
                this.data = undefined;
                this.noDataToDisplay = true;
                this.sessionsAvailable = false;
                this.isLoading = false;
            });
    }

    addColor(sessions) {
        var i = 0;
        var sessionData = [];

        sessions.forEach(ele => {
            ele.slotColor = ele.available_capacity <= 0 ? 'datatable-slotUnavailable' : 'datatable-slotAvailable';
            ele.turnOff = ele.available_capacity <= 0 ? true : false;
            ele.ageColor = ele.min_age_limit >= 45 ? 'datatable-slotUnavailable' : 'datatable-slotAvailable';
            switch(ele.vaccine){
                case "COVAXIN":
                    ele.vaccineColor = 'datatable-covaxin';
                    break;
                case "COVISHIELD":
                    ele.vaccineColor = 'datatable-covishield';
                    break;
            }
            sessionData.push(ele);
        });

        this.showFilters = true;
        this.allVaccineCenters = sessionData;
        this.items = sessionData;
        this.totalRecountCount = sessionData.length; 
        this.totalPage = Math.ceil(this.totalRecountCount / this.pageSize); 
        this.data = this.items.slice(0,this.pageSize); 
        this.endingRecord = this.pageSize;
    }

    previousHandler() {
        if (this.page > 1) {
            this.page = this.page - 1; //decrease page by 1
            this.displayRecordPerPage(this.page);
        }
    }

    nextHandler() {
        if((this.page<this.totalPage) && this.page !== this.totalPage){
            this.page = this.page + 1; //increase page by 1
            this.displayRecordPerPage(this.page);            
        }             
    }

    displayRecordPerPage(page){
        this.startingRecord = ((page -1) * this.pageSize) ;
        this.endingRecord = (this.pageSize * page);
        this.endingRecord = (this.endingRecord > this.totalRecountCount) 
                            ? this.totalRecountCount : this.endingRecord; 
        this.data = this.items.slice(this.startingRecord, this.endingRecord);
        this.startingRecord = this.startingRecord + 1;
    } 

    handleCalendarByPin() {
        this.data = [];
        this.allVaccineCenters = [];
        this.isLoading = true;
        let params = {};
        params.pincode = this.selectedPin;
        params.vaccDate = this.selectedDate;

        calendarByPin(params)
            .then((result) => {
                this.addColor(result);
                this.noPinSlotsToDisplay = false;
                this.isLoading = false;
                this.pinSessionsAvailable = true;
            })
            .catch((error) => {
                this.error = error;
                this.data = undefined;
                this.noPinSlotsToDisplay = true;
                this.sessionsAvailable = false;
                this.isLoading = false;
            });
    }

    handleAvailableSlotSearch() {
        this.data = this.allVaccineCenters;
        this.isLoading = true;
        var filteredData = [];

        if(this.data.length > 0) {
            this.data.forEach(ele => {
                if (ele.available_capacity > 0) {
                    filteredData.push(ele);
                }
            });
            this.isLoading = false;
            if (filteredData.length === 0) {
                this.noFilteredDataToDisplay = true;
                this.sessionsAvailable = false;
                this.pinSessionsAvailable = false;
            } else {
                this.noFilteredDataToDisplay = false;
                this.items = filteredData;
                this.totalRecountCount = filteredData.length; 
                this.totalPage = Math.ceil(this.totalRecountCount / this.pageSize); 
                this.data = this.items.slice(0,this.pageSize); 
                this.endingRecord = this.pageSize;
            }
        } else {
            this.noFilteredDataToDisplay = true;
            this.sessionsAvailable = false;
            this.pinSessionsAvailable = false;
            this.isLoading = false;
        }
    }

    handle18PlusSearch() {
        this.data = this.allVaccineCenters;
        this.isLoading = true;
        var filteredData = [];

        if(this.data.length > 0) {
            this.data.forEach(ele => {
                if (ele.min_age_limit === 18) {
                    filteredData.push(ele);
                }
            });
            this.isLoading = false;
            if (filteredData.length === 0) {
                this.noFilteredDataToDisplay = true;
                this.sessionsAvailable = false;
                this.pinSessionsAvailable = false;
            } else {
                this.noFilteredDataToDisplay = false;
                this.items = filteredData;
                this.totalRecountCount = filteredData.length; 
                this.totalPage = Math.ceil(this.totalRecountCount / this.pageSize); 
                this.data = this.items.slice(0,this.pageSize); 
                this.endingRecord = this.pageSize;
            }
        } else {
            this.noFilteredDataToDisplay = true;
            this.sessionsAvailable = false;
            this.pinSessionsAvailable = false;
            this.isLoading = false;
        }
    }

    handle45PlusSearch() {
        this.data = this.allVaccineCenters;
        this.isLoading = true;
        var filteredData = [];

        if(this.data.length > 0) {
            this.data.forEach(ele => {
                if (ele.min_age_limit === 45) {
                    filteredData.push(ele);
                }
            });
            this.isLoading = false;

            if (filteredData.length === 0) {
                this.noFilteredDataToDisplay = true;
                this.sessionsAvailable = false;
                this.pinSessionsAvailable = false;
            } else {
                this.noFilteredDataToDisplay = false;
                this.items = filteredData;
                this.totalRecountCount = filteredData.length; 
                this.totalPage = Math.ceil(this.totalRecountCount / this.pageSize); 
                this.data = this.items.slice(0,this.pageSize); 
                this.endingRecord = this.pageSize;
            }
        } else {
            this.noFilteredDataToDisplay = true;
            this.sessionsAvailable = false;
            this.pinSessionsAvailable = false;
            this.isLoading = false;
        }
    }

    handleCovishieldSearch() {
        this.data = this.allVaccineCenters;
        this.isLoading = true;
        var filteredData = [];

        if(this.data.length > 0) {
            this.data.forEach(ele => {
                if (ele.vaccine === 'COVISHIELD') {
                    filteredData.push(ele);
                }
            });
            this.isLoading = false;
            if (filteredData.length === 0) {
                this.noFilteredDataToDisplay = true;
                this.sessionsAvailable = false;
                this.pinSessionsAvailable = false;
            } else {
                this.noFilteredDataToDisplay = false;
                this.items = filteredData;
                this.totalRecountCount = filteredData.length; 
                this.totalPage = Math.ceil(this.totalRecountCount / this.pageSize); 
                this.data = this.items.slice(0,this.pageSize); 
                this.endingRecord = this.pageSize;
            }
        } else {
            this.noFilteredDataToDisplay = true;
            this.sessionsAvailable = false;
            this.pinSessionsAvailable = false;
            this.isLoading = false;
        }
    }

    handleCovaxinSearch() {
        this.data = this.allVaccineCenters;
        this.isLoading = true;
        var filteredData = [];

        if(this.data.length > 0) {
            this.data.forEach(ele => {
                if (ele.vaccine === 'COVAXIN') {
                    filteredData.push(ele);
                }
            });
            this.isLoading = false;
            if (filteredData.length === 0) {
                this.noFilteredDataToDisplay = true;
                this.sessionsAvailable = false;
                this.pinSessionsAvailable = false;
            } else {
                this.noFilteredDataToDisplay = false;
                this.items = filteredData;
                this.totalRecountCount = filteredData.length; 
                this.totalPage = Math.ceil(this.totalRecountCount / this.pageSize); 
                this.data = this.items.slice(0,this.pageSize); 
                this.endingRecord = this.pageSize;
            }
        } else {
            this.noFilteredDataToDisplay = true;
            this.sessionsAvailable = false;
            this.pinSessionsAvailable = false;
            this.isLoading = false;
        }
    }

    handleResetFilters() {
        this.isLoading = false;
        this.noFilteredDataToDisplay = false;
        this.noPinSlotsToDisplay = false;
        this.noDataToDisplay = false;
        this.data = this.allVaccineCenters;

        if (this.data.length > 0) {
            switch(this.activeTab){
                case "1":
                    this.sessionsAvailable = true;
                    break;
                case "2":
                    this.pinSessionsAvailable = true;
                    break;
            }
            this.items = this.data;
            this.totalRecountCount = this.items.length; 
            this.totalPage = Math.ceil(this.totalRecountCount / this.pageSize); 
            this.data = this.items.slice(0,this.pageSize); 
            this.endingRecord = this.pageSize;
        }
    }

    resetAll(){
        this.isLoading = false;
        this.data = [];
        this.items = [];
        this.allVaccineCenters = [];
        this.noFilteredDataToDisplay = false;
        this.template.querySelectorAll('lightning-input').forEach(each => {
            each.value = '';
        });
        this.showFilters = false;
        this.noDataToDisplay = false;
        this.sessionsAvailable = false;
        this.pinSessionsAvailable = false;
        this.noPinSlotsToDisplay = false;
        this.searchKey = '';
        this.chosenDate = '';
    }
}