import { inject, bindable, BindingEngine, observable, computedFrom } from 'aurelia-framework'
import { Service, CoreService } from './service';

import AccountBankLoader from "../../../loader/account-banks-loader";
import BuyerBrandLoader from "../../../loader/garment-buyers-loader";

@inject(BindingEngine, Service,CoreService, Element)
export class DataForm {
  @bindable isCreate = false;
  @bindable itemOptions = {};
  @bindable readOnly = false;
  @bindable data = {};
  @bindable error = {};
  @bindable hasItems = false;
  @bindable type = "Ekspor";
  lampHeader = [{ header: "Standar Lampu" }];

  DeliveryOptions = ["BY LAND", "BY SEA", "BY AIR", "BY SEA-AIR"];
  
  countries =
    ["", "Afghanistan", "Albania", "Algeria", "Andorra", "Angola", "Anguilla", "Antigua and Barbuda", "Argentina", "Armenia", "Aruba", "Australia", "Austria", "Azerbaijan", "Bahamas", "Bahrain", "Bangladesh", "Barbados", "Belarus", "Belgium", "Belize", "Benin", "Bermuda", "Bhutan", "Bolivia", "Bosnia and Herzegovina", "Botswana", "Brazil", "British Virgin Islands", "Brunei", "Bulgaria", "Burkina Faso", "Burundi", "Cambodia", "Cameroon", "Canada", "Cape Verde", "Cayman Islands", "Chad", "Chile", "China", "Colombia", "Congo", "Cook Islands", "Costa Rica", "Cote D Ivoire", "Croatia", "Cruise Ship", "Cuba", "Cyprus", "Czech Republic", "Denmark", "Djibouti", "Dominica", "Dominican Republic", "Ecuador", "Egypt", "El Salvador", "Equatorial Guinea", "Estonia", "Ethiopia", "Falkland Islands", "Faroe Islands", "Fiji", "Finland", "France", "French Polynesia", "French West Indies", "Gabon", "Gambia", "Georgia", "Germany", "Ghana", "Gibraltar", "Greece", "Greenland", "Grenada", "Guam", "Guatemala", "Guernsey", "Guinea", "Guinea Bissau", "Guyana", "Haiti", "Honduras", "Hong Kong", "Hungary", "Iceland", "India", "Indonesia", "Iran", "Iraq", "Ireland", "Isle of Man", "Israel", "Italy", "Jamaica", "Japan", "Jersey", "Jordan", "Kazakhstan", "Kenya", "Kuwait", "Kyrgyz Republic", "Laos", "Latvia", "Lebanon", "Lesotho", "Liberia", "Libya", "Liechtenstein", "Lithuania", "Luxembourg", "Macau", "Macedonia", "Madagascar", "Malawi", "Malaysia", "Maldives", "Mali", "Malta", "Mauritania", "Mauritius", "Mexico", "Moldova", "Monaco", "Mongolia", "Montenegro", "Montserrat", "Morocco", "Mozambique", "Namibia", "Nepal", "Netherlands", "Netherlands Antilles", "New Caledonia", "New Zealand", "Nicaragua", "Niger", "Nigeria", "North Korea", "Norway", "Oman", "Pakistan", "Palestine", "Panama", "Papua New Guinea", "Paraguay", "Peru", "Philippines", "Poland", "Portugal", "Puerto Rico", "Qatar", "Reunion", "Romania", "Russia", "Rwanda", "Saint Pierre and Miquelon", "Samoa", "San Marino", "Satellite", "Saudi Arabia", "Senegal", "Serbia", "Seychelles", "Sierra Leone", "Singapore", "Slovakia", "Slovenia", "South Africa", "South Korea", "Spain", "Sri Lanka", "St Kitts and Nevis", "St Lucia", "St Vincent", "St. Lucia", "Sudan", "Suriname", "Swaziland", "Sweden", "Switzerland", "Syria", "Taiwan", "Tajikistan", "Tanzania", "Thailand", "Timor L'Este", "Togo", "Tonga", "Trinidad and Tobago", "Tunisia", "Turkey", "Turkmenistan", "Turks and Caicos", "Uganda", "Ukraine", "United Arab Emirates", "United Kingdom", "United States of America", "Uruguay", "Uzbekistan", "Venezuela", "Vietnam", "Virgin Islands (US)", "Yemen", "Zambia", "Zimbabwe"];

  filterBank = {
    "DivisionName.toUpper()":"AMBASSADOR GARMINDO 2"
  };

  constructor(bindingEngine, service,coreService, element) {
    this.bindingEngine = bindingEngine;
    this.element = element;
    this.service = service;
    this.coreService = coreService;
  }

  async bind(context) {
    this.context = context;
    this.data = context.data;
    this.error = context.error;
    this.data.CreatedUtc = this.data.CreatedUtc ? this.data.CreatedUtc : new Date();
    // this.itemsInfo.options = {
    //   ROList: []
    // }

    this.itemOptions = {
      ROList: []
    }    

    if(this.data.SalesContractNo) {
      this.selectedRO = {
        RO_Number : this.data.RONumber
      }

      this.data.comodity = this.data.ComodityCode + " - " + this.data.ComodityName;

      if(this.data.AccountBankId || this.data.AccountBank.Id){
        var accId = this.data.AccountBankId ? this.data.AccountBankId: this.data.AccountBank.Id;
        this.selectedAccountBank = await this.service.getAccountBankById(accId);
      }

      this.data.buyer = this.data.BuyerBrandCode + " - " +this.data.BuyerBrandName;
      var buyerBrand = await this.coreService.getBuyerBrandById(this.data.BuyerBrandId);
      var buyer = await this.coreService.getBuyerById(buyerBrand.Buyers.Id);
      this.type = buyer.Type;
      this.data.SCType = this.type;
      this.selectedBuyer = buyerBrand;

      if(this.data.SalesContractROs) {
        this.data.SalesContractROs.forEach(
          item => {
            this.itemOptions.ROList.push(item.RONumber);
          }
        );
      }
    }

    // this.hasItems=false;
    // if(this.data.Items)
    //   if(this.data.Items.length>0){
    //     this.data.Amount=0;
    //     for(var item of this.data.Items){
    //       item.Uom=this.data.Uom.Unit;
    //       item.PricePerUnit=this.data.Uom.Unit;
    //       this.data.Amount+=item.Price*item.Quantity;
    //     }
    //     this.hasItems=true;
    //   }
    //   if(this.data.Amount)
    //     this.data.Amount=this.data.Amount.toLocaleString('en-EN', { minimumFractionDigits: 2})
    //   if(this.data.Price){
    //     this.data.Price=this.data.Price.toLocaleString('en-EN', { minimumFractionDigits: 2})
    //   }

    if(!this.data.DocPresented || this.data.DocPresented==""){
      this.data.DocPresented="INVOICE OF COMMERCIAL VALUE \nPACKING LIST \nEXPORT LICENSE \nCERTIFICATE OF ORIGIN / G.S.P FORM A \nINSPECTION CERTIFICATE ";
    }
    
  }

  @bindable selectedAccountBank;
  selectedAccountBankChanged(newValue, oldValue) {
    if (newValue) {
      this.data.AccountBank =newValue;
    } else {
      this.data.AccountBank = null;
    }
  }


  get detailHeader() {
      return [{ header: "RO" },{ header: "Article" }, 
              { header: "Komoditi" },{ header: "Material" },
              { header: "Quantity" }, { header: "Satuan" }, 
              { header: "Harga" }, { header: "Amount" },
              { header: "Tanggal Pengiriman" }];
  }

  get addItems() {
    return (event) => {
      this.data.SalesContractROs.push({
        buyer: this.data.BuyerBrandId,
        type: this.data.SCType
      });
    };
  }

  get accountBankLoader() {
    return AccountBankLoader;
  }

  bankView(bank) {
    return bank.AccountName ? `${bank.AccountName} - ${bank.BankName} - ${bank.AccountNumber} - ${bank.Currency.Code}` : '';
  }

  controlOptions = {
    label: {
      length: 4
    },
    control: {
      length: 7,
      align: "right"
    }
  }

  get buyerLoader() {
    return BuyerBrandLoader;
  }

  buyerView(buyer) {
    return `${buyer.Code} - ${buyer.Name}` ;
  }
  
  get removeItems() {
    return async (event) => //console.log(event.detail);
    {
        console.log(event);

        var _ro = event.detail.RONumber;

        if(this.itemOptions.ROList.includes(_ro)){
          this.itemOptions.ROList.splice(this.itemOptions.ROList.indexOf(_ro), 1);
        }

        if(this.data.Items){
          this.data.Amount = 0;
          for(var item of this.data.Items){
            if(item.Amount){
              this.data.Amount += parseFloat(item.Amount);
            }
          }
        }

        this.data.Amount=parseFloat(this.data.Amount).toLocaleString('en-EN', { minimumFractionDigits: 2});
      }
    }
  
  @bindable selectedBuyer;
  async selectedBuyerChanged(newValue){
    if(!this.data.Id && this.data.SalesContractROs){
      this.data.SalesContractROs.splice(0);
    }
    if(newValue){
      this.data.BuyerBrandName= newValue.Name;
      this.data.BuyerBrandCode= newValue.Code;
      this.data.BuyerBrandId=newValue.Id;
      var buyerBrand= await this.coreService.getBuyerBrandById(this.data.BuyerBrandId);
      var buyer= await this.coreService.getBuyerById(buyerBrand.Buyers.Id);
      this.type= buyer.Type;
      this.data.SCType= buyer.Type;
      if(this.type=="Ekspor"){
        this.data.SalesContractROs.push({
          buyer: this.data.BuyerBrandId,
          type: this.data.SCType
        })
      }
    }
  }
  
  get amount(){
    this.data.Amount=0;
    if(this.data.SalesContractROs)
      for(var item of this.data.SalesContractROs)
        if(this.data.SalesContractROs){
          this.data.Amount+=parseFloat(item.Amount);
        }
    return this.data.Amount;
  }

  async itemsChanged(e){
    this.hasItems=true;
    this.data.Amount=0;
    if(this.data.SalesContractROs){
        for(var item of this.data.SalesContractROs){
            if(item.Amount){
                this.data.Amount+=parseFloat(item.Amount);
            }
        }
       // this.data.Amount=parseFloat(this.data.Amount).toLocaleString('en-EN', { minimumFractionDigits: 2});
        
       // console.log(this.data.Amount)
    }
}
}
