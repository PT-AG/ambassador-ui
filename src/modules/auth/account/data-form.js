import { inject, bindable, computedFrom, BindingEngine } from 'aurelia-framework';
import EmployeeLoader from '../../../loader/employees-by-digitalId';

@inject(BindingEngine, Element)
export class DataForm {
    @bindable isCreate = false;
    @bindable isView = false;
    @bindable readOnly = false;
    @bindable employee;
    @bindable data = {};
    @bindable error = {};

    genderList = ['LAKI-LAKI', 'PEREMPUAN'];

    countries = ["Afghanistan", "Albania", "Algeria", "Andorra", "Angola", "Anguilla", "Antigua &amp; Barbuda", "Argentina", "Armenia", "Aruba", "Australia", "Austria", "Azerbaijan", "Bahamas", "Bahrain", "Bangladesh", "Barbados", "Belarus", "Belgium", "Belize", "Benin", "Bermuda", "Bhutan", "Bolivia", "Bosnia &amp; Herzegovina", "Botswana", "Brazil", "British Virgin Islands", "Brunei", "Bulgaria", "Burkina Faso", "Burundi", "Cambodia", "Cameroon", "Cape Verde", "Cayman Islands", "Chad", "Chile", "China", "Colombia", "Congo", "Cook Islands", "Costa Rica", "Cote D Ivoire", "Croatia", "Cruise Ship", "Cuba", "Cyprus", "Czech Republic", "Denmark", "Djibouti", "Dominica", "Dominican Republic", "Ecuador", "Egypt", "El Salvador", "Equatorial Guinea", "Estonia", "Ethiopia", "Falkland Islands", "Faroe Islands", "Fiji", "Finland", "France", "French Polynesia", "French West Indies", "Gabon", "Gambia", "Georgia", "Germany", "Ghana", "Gibraltar", "Greece", "Greenland", "Grenada", "Guam", "Guatemala", "Guernsey", "Guinea", "Guinea Bissau", "Guyana", "Haiti", "Honduras", "Hong Kong", "Hungary", "Iceland", "India", "Indonesia", "Iran", "Iraq", "Ireland", "Isle of Man", "Israel", "Italy", "Jamaica", "Japan", "Jersey", "Jordan", "Kazakhstan", "Kenya", "Kuwait", "Kyrgyz Republic", "Laos", "Latvia", "Lebanon", "Lesotho", "Liberia", "Libya", "Liechtenstein", "Lithuania", "Luxembourg", "Macau", "Macedonia", "Madagascar", "Malawi", "Malaysia", "Maldives", "Mali", "Malta", "Mauritania", "Mauritius", "Mexico", "Moldova", "Monaco", "Mongolia", "Montenegro", "Montserrat", "Morocco", "Mozambique", "Namibia", "Nepal", "Netherlands", "Netherlands Antilles", "New Caledonia", "New Zealand", "Nicaragua", "Niger", "Nigeria", "Norway", "Oman", "Pakistan", "Palestine", "Panama", "Papua New Guinea", "Paraguay", "Peru", "Philippines", "Poland", "Portugal", "Puerto Rico", "Qatar", "Reunion", "Romania", "Russia", "Rwanda", "Saint Pierre &amp; Miquelon", "Samoa", "San Marino", "Satellite", "Saudi Arabia", "Senegal", "Serbia", "Seychelles", "Sierra Leone", "Singapore", "Slovakia", "Slovenia", "South Africa", "South Korea", "Spain", "Sri Lanka", "St Kitts &amp; Nevis", "St Lucia", "St Vincent", "St. Lucia", "Sudan", "Suriname", "Swaziland", "Sweden", "Switzerland", "Syria", "Taiwan", "Tajikistan", "Tanzania", "Thailand", "Timor L'Este", "Togo", "Tonga", "Trinidad &amp; Tobago", "Tunisia", "Turkey", "Turkmenistan", "Turks &amp; Caicos", "Uganda", "Ukraine", "United Arab Emirates", "United Kingdom", "Uruguay", "Uzbekistan", "Venezuela", "Vietnam", "Virgin Islands (US)", "Yemen", "Zambia", "Zimbabwe"];
    selectedCountry = '';
    
    constructor(bindingEngine, element) {
        this.bindingEngine = bindingEngine;
        this.element = element;
    }
    
    get employeeLoader() {
        return EmployeeLoader;
    }

    async bind(context) {
        this.context = context;
        this.data = context.data;
        this.error = context.error;

        // Only initialize employee if data already exists (edit mode)
        if (this.data && this.data.digitalId) {
            this.employee = {
                DigitalId: this.data.digitalId,
                Name: `${this.data.profile.firstname || ""} ${this.data.profile.lastname || ""}`.trim()
            };
        } else {
            this.employee = null;
        }
    }

    employeeChanged(newValue) {
        var selectedEmployee = newValue;
        if (selectedEmployee) {
            this.data.DigitalId = selectedEmployee.DigitalId;
            const fullName = (selectedEmployee ? selectedEmployee.Name : "").trim();
            const parts = fullName.trim().split(/\s+/);

            this.data.profile.firstname = parts[0] || "";
            this.data.profile.lastname = parts.length > 1 ? parts.slice(1).join(" ") : "";
        }
    }
    
    employeeView = (item) => {    
        if (!item) return "";
        
        const name = item.Name || "";
        const did = item.DigitalId || "";

        return `${name} ${did ? ('- ' + did) : ''}`.trim();
    }

    @computedFrom("data._id")
    get isEdit() {
        return (this.data._id || '').toString() != '';
    }

    // activate() { 
    // }

    // attached() { 
    // }

    controlOptions = {
        label: {
            length: 3
        },
        control: {
            length: 4,
        }
    }
} 
