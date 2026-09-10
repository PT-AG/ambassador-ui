import { inject, bindable, BindingEngine, observable, computedFrom } from 'aurelia-framework'
import { Service } from "./service";
import { CoreService } from "./service";
import { AuthService } from 'aurelia-authentication';
import moment from 'moment';
var InvoiceLoader = require('../../../loader/garment-packing-list-not-used-loader');
var AccountBankLoader = require('../../../loader/account-banks-loader');
var FabricTypeLoader = require('../../../loader/fabric-type-loader');
var SectionLoader = require('../../../loader/garment-sections-loader');
var BuyerLoader = require('../../../loader/garment-buyers-loader');
var ShippingStaffLoader = require('../../../loader/garment-shipping-staff-loader');

@inject(Service, CoreService, AuthService)
export class DataForm {
    @bindable packinglists;
    @bindable shippingStaff;
    @bindable section;
    @bindable bankAccount;
    @bindable buyer;
    @bindable fabricType;
    @bindable invoiceType;
    @bindable data = {};
    @bindable items = {};
    @bindable readOnly = false;
    @bindable readOnlyDesc1 = false;
    @bindable read = true;
    @bindable isCreate = false;
    @bindable isEdit = false;
    @bindable isUsed = false;
    @bindable isUpdated = false;
    @bindable dataItems = [];
    @bindable username = "";

    constructor(service, coreService, authService) {
        this.service = service;
        this.coreService = coreService;
        this.authService = authService;
    };

    INCOTERMSOptions = ["FOB", "FAS", "CFR", "CIF", "EXW", "FCA", "CPT", "CIP", "DAT", "DAP", "DDP"];
    fabricTypeOptions = ["POLYESTER/COTTON ( T/C )", "COTTON/POLYESTER ( CVC )", "COTTON", "VISCOSE", "VISCOSE POLYESTER", "VISCOSE FUJIETTE", "POLYESTER"];
    countries = ["", "AFGHANISTAN", "ALBANIA", "ALGERIA", "ANDORRA", "ANGOLA", "ANGUILLA", "ANTIGUA AND BARBUDA", "ARGENTINA", "ARMENIA", "ARUBA", "AUSTRALIA", "AUSTRIA", "AZERBAIJAN", "BAHAMAS", "BAHRAIN", "BANGLADESH", "BARBADOS", "BELARUS", "BELGIUM", "BELIZE", "BENIN", "BERMUDA", "BHUTAN", "BOLIVIA", "BOSNIA AND HERZEGOVINA", "BOTSWANA", "BRAZIL", "BRITISH VIRGIN ISLANDS", "BRUNEI", "BULGARIA", "BURKINA FASO", "BURUNDI", "CAMBODIA", "CAMEROON", "CANADA", "CAPE VERDE", "CAYMAN ISLANDS", "CHAD", "CHILE", "CHINA", "COLOMBIA", "CONGO", "COOK ISLANDS", "COSTA RICA", "COTE D IVOIRE", "CROATIA", "CRUISE SHIP", "CUBA", "CYPRUS", "CZECH REPUBLIC", "DENMARK", "DJIBOUTI", "DOMINICA", "DOMINICAN REPUBLIC", "ECUADOR", "EGYPT", "EL SALVADOR", "EQUATORIAL GUINEA", "ESTONIA", "ETHIOPIA", "FALKLAND ISLANDS", "FAROE ISLANDS", "FIJI", "FINLAND", "FRANCE", "FRENCH POLYNESIA", "FRENCH WEST INDIES", "GABON", "GAMBIA", "GEORGIA", "GERMANY", "GHANA", "GIBRALTAR", "GREECE", "GREENLAND", "GRENADA", "GUAM", "GUATEMALA", "GUERNSEY", "GUINEA", "GUINEA BISSAU", "GUYANA", "HAITI", "HONDURAS", "HONG KONG", "HUNGARY", "ICELAND", "INDIA", "INDONESIA", "IRAN", "IRAQ", "IRELAND", "ISLE OF MAN", "ISRAEL", "ITALY", "JAMAICA", "JAPAN", "JERSEY", "JORDAN", "KAZAKHSTAN", "KENYA", "KUWAIT", "KYRGYZ REPUBLIC", "LAOS", "LATVIA", "LEBANON", "LESOTHO", "LIBERIA", "LIBYA", "LIECHTENSTEIN", "LITHUANIA", "LUXEMBOURG", "MACAU", "MACEDONIA", "MADAGASCAR", "MALAWI", "MALAYSIA", "MALDIVES", "MALI", "MALTA", "MAURITANIA", "MAURITIUS", "MEXICO", "MOLDOVA", "MONACO", "MONGOLIA", "MONTENEGRO", "MONTSERRAT", "MOROCCO", "MOZAMBIQUE", "NAMIBIA", "NEPAL", "NETHERLANDS", "NETHERLANDS ANTILLES", "NEW CALEDONIA", "NEW ZEALAND", "NICARAGUA", "NIGER", "NIGERIA", "NORTH KOREA", "NORWAY", "OMAN", "PAKISTAN", "PALESTINE", "PANAMA", "PAPUA NEW GUINEA", "PARAGUAY", "PERU", "PHILIPPINES", "POLAND", "PORTUGAL", "PUERTO RICO", "QATAR", "REUNION", "ROMANIA", "RUSSIA", "RWANDA", "SAINT PIERRE AND MIQUELON", "SAMOA", "SAN MARINO", "SATELLITE", "SAUDI ARABIA", "SENEGAL", "SERBIA", "SEYCHELLES", "SIERRA LEONE", "SINGAPORE", "SLOVAKIA", "SLOVENIA", "SOUTH AFRICA", "SOUTH KOREA", "SPAIN", "SRI LANKA", "ST KITTS AND NEVIS", "ST LUCIA", "ST VINCENT", "ST. LUCIA", "SUDAN", "SURINAME", "SWAZILAND", "SWEDEN", "SWITZERLAND", "SYRIA", "TAIWAN", "TAJIKISTAN", "TANZANIA", "THAILAND", "TIMOR L'ESTE", "TOGO", "TONGA", "TRINIDAD AND TOBAGO", "TUNISIA", "TURKEY", "TURKMENISTAN", "TURKS AND CAICOS", "UGANDA", "UKRAINE", "UNITED ARAB EMIRATES", "UNITED KINGDOM", "UNITED STATES OF AMERICA", "URUGUAY", "UZBEKISTAN", "VENEZUELA", "VIETNAM", "VIRGIN ISLANDS (US)", "YEMEN", "ZAMBIA", "ZIMBABWE"];
    invoiceTypes = ["AG", "DS-Commercial", "DS", "SM-Non-Commercial"];

    bind(context) {
        this.context = context;
        this.data = context.data;
        this.error = context.error;
        this.save = this.context.saveCallback;
        this.cancel = this.context.cancelCallback;
        this.options = {
            header: this.data,
            isCreate: this.context.isCreate,
            isView: this.context.isView,
            isEdit: this.context.isEdit,
            isUpdated: this.context.isUpdated,
            isUsed: this.context.isUsed,
            itemData: this.data.items,
            data: this.data,
        }

        if (this.authService.authenticated) {
            const me = this.authService.getTokenPayload();
            this.username = me.username;
        }

        this.isEdit = this.context.isEdit;
        this.isUpdated = this.context.isUpdated;

        if (this.data.id != undefined) {
            if (this.data.bankAccountId > 0) {
                this.coreService.getBankAccountById(this.data.bankAccountId)
                    .then(result => {
                        this.bankAccount =
                        {
                            Id: this.data.bankAccountId,
                            BankName: result.BankName,
                            Currency: {
                                Code: result.Currency.Code
                            }
                        };

                        this.data.bankAccount = result.BankName;
                    });
            }

            if (this.data.packingListType == "LOKAL") {
                this.fabricType = this.data.fabricType;
            } else {
                this.fabricType = {
                    Id: this.data.fabricTypeId,
                    Name: this.data.fabricType
                }
            }

            if (this.data.shippingStaffId > 0) {
                this.shippingStaff = {
                    id: this.data.shippingStaffId,
                    name: this.data.shippingStaff
                }
            }

            if (this.data.section) {
                this.section = {
                    id: this.data.section.id,
                    code: this.data.section.code
                }
            }

            if (this.data.buyerAgent) {
                this.buyer = this.data.buyerAgent;
            }

            this.data.bankAccountId = this.data.bankAccountId;
            this.packinglists = this.data.invoiceNo;
            this.packingListType = this.data.packingListType;

            this.data.npeDate = moment(this.data.npeDate).format("DD-MMM-YYYY") == "01-Jan-0001" ? null : this.data.npeDate;
            this.data.blDate = moment(this.data.blDate).format("DD-MMM-YYYY") == "01-Jan-0001" ? null : this.data.blDate;
            this.data.coDate = moment(this.data.coDate).format("DD-MMM-YYYY") == "01-Jan-0001" ? null : this.data.coDate;
            this.data.pebDate = moment(this.data.pebDate).format("DD-MMM-YYYY") == "01-Jan-0001" ? null : this.data.pebDate;
            this.data.cotpDate = moment(this.data.cotpDate).format("DD-MMM-YYYY") == "01-Jan-0001" ? null : this.data.cotpDate;
        }
    };

    @bindable title;
    controlOptions = {
        label: {
            length: 3
        },
        control: {
            length: 5
        }
    };

    footerOptions = {
        label: {
            length: 3
        },
        control: {
            length: 2
        }
    };

    paymentDueOptions = {
        label: {
            length: 3
        },
        control: {
            length: 5
        }
    };

    get buyerLoader() {
        return BuyerLoader;
    };

    buyerView = (buyer) => {
        var buyerName = buyer.Name || buyer.name;
        var buyerCode = buyer.Code || buyer.code;
        return `${buyerCode} - ${buyerName}`
    };

    get invoiceLoader() {
        return InvoiceLoader;
    };

    invoiceView = (inv) => {
        return `${inv.invoiceNo}`;
    };

    get accountBankLoader() {
        return AccountBankLoader;
    };

    accountBankView = (acc) => {
        return `${acc.BankName} - ${acc.Currency.Code}`;
    };

    get shippingStaffLoader() {
        return ShippingStaffLoader;
    };

    shippingStaffView = (acc) => {
        return `${acc.Name || acc.name}`;
    };

    get sectionLoader() {
        return SectionLoader;
    };

    sectionView = (section) => {
        if (section.Name || section.name) {
            return `${section.Code || section.code} - ${section.Name || section.name}`
        } else {
            return `${section.Code || section.code}`;
        }
    };

    get fabricTypeLoader() {
        return FabricTypeLoader;
    };

    fabricTypeView = (acc) => {
        return `${acc.Name}`;
    };

    async invoiceTypeChanged(newValue, oldValue) {
        if (this.data.id) return;

        this.data.items = [];
        this.data.itemsByPackingInvoice = [];

        this.data.invoiceType = this.invoiceType;

        this.loadPackingList();
    }
    
    async shippingStaffChanged(newValue, oldValue) {
        if (this.data.id) return;

        if (!newValue) {
            this.data.shippingStaff = null;
            this.shippingStaff = null;
        } else {
            // Cegah loop: hanya update jika value benar-benar berbeda
            const id = newValue.Id || newValue.id;
            const name = newValue.Name || newValue.name;

            if (
                this.shippingStaff &&
                this.shippingStaff.id === id &&
                this.shippingStaff.name === name
            ) {
                return; // Sudah sama, tidak perlu update
            }

            if (newValue != this.data.shippingStaff) {
                if (this.data.items && this.data.items.length > 0) {
                    this.data.items.splice(0);
                }
                
                if (this.data.itemsByPackingInvoice && this.data.itemsByPackingInvoice.length > 0) {
                    this.data.itemsByPackingInvoice.splice(0);
                }

                this.shippingStaff = { id, name };
                this.data.shippingStaff = this.shippingStaff;
            }

            this.loadPackingList();
        }
    };

    async sectionChanged(newValue, oldValue) {
        if (this.data.id) return;

        if (!newValue) {
            this.data.section = null;
            this.section = null;
        } else {
            // Cegah loop: hanya update jika value benar-benar berbeda
            const id = newValue.Id || newValue.id;
            const name = newValue.Name || newValue.name;
            const code = newValue.Code || newValue.code;

            if (
                this.section &&
                this.section.id === id &&
                this.section.name === name &&
                this.section.code === code
            ) {
                return; // Sudah sama, tidak perlu update
            }

            if (newValue != this.data.section) {
                this.data.section = null;
                this.section = null;

                if (this.data.items && this.data.items.length > 0) {
                    this.data.items.splice(0);
                }

                if (this.data.itemsByPackingInvoice && this.data.itemsByPackingInvoice.length > 0) {
                    this.data.itemsByPackingInvoice.splice(0);
                }

                this.data.section = {
                    id: id,
                    name: name,
                    code: code
                };

                this.section = this.data.section;
            }

            this.loadPackingList();
        }
    };

    async buyerChanged(newValue, oldValue) {
        if (this.data.id) return;

        if (!newValue) {
            this.data.buyerAgent = null;
            this.data.consigneeAddress = null;
            this.buyer = null;
        } else {
            // Cegah loop: hanya update jika value benar-benar berbeda
            const id = newValue.Id || newValue.id;
            const name = newValue.Name || newValue.name;
            const code = newValue.Code || newValue.code;

            if (
                this.buyer &&
                this.buyer.id === id &&
                this.buyer.name === name &&
                this.buyer.code === code
            ) {
                return; // Sudah sama, tidak perlu update
            }

            if (newValue != this.data.buyerAgent) {
                this.data.buyerAgent = null;
                this.data.consigneeAddress = null;
                this.buyer = null;

                if (this.data.items && this.data.items.length > 0) {
                    this.data.items.splice(0);
                }

                if (this.data.itemsByPackingInvoice && this.data.itemsByPackingInvoice.length > 0) {
                    this.data.itemsByPackingInvoice.splice(0);
                }

                this.data.buyerAgent = newValue;
                this.buyer = this.data.buyerAgent;

                if (newValue) {
                    var buyerBrand = await this.coreService.getBuyerById(newValue.Id);
                    if (buyerBrand) {
                        this.data.consigneeAddress = buyerBrand.Address;
                    }
                }
            }

            this.loadPackingList();
        }
    };

    bankAccountChanged(newValue, oldValue) {
        var selectedAccount = newValue;
        if (selectedAccount) {
            this.data.bankAccountId = selectedAccount.Id;
            this.data.bankAccount = selectedAccount.BankName;
        }
    };

    fabricTypeChanged(newValue, oldValue) {
        var selectedfabric = newValue;
        if (selectedfabric && this.data.packingListType == "LOKAL") {
            this.data.fabricTypeId = 0;
            this.data.fabricType = selectedfabric;
        } else if (selectedfabric && this.data.packingListType == "EXPORT") {
            this.data.fabricTypeId = selectedfabric.Id;
            this.data.fabricType = selectedfabric.Name;
        }
    };

    async loadPackingList() {
        if (this.data.id) return;

        if (this.data.invoiceType != null && (this.data.buyerAgent.id || this.data.buyerAgent.Id) && (this.data.section.id || this.data.section.Id) && (this.data.shippingStaff.name || this.data.shippingStaff.Name)) {
            var filter = {
                ShippingStaffName: this.data.shippingStaff.name || this.data.shippingStaff.Name,
                'status=="CREATED" || status=="APPROVED_SHIPPING"': true,
                BuyerAgentId: this.data.buyerAgent.id || this.data.buyerAgent.Id,
                SectionId: this.data.section.id || this.data.section.Id,
                'packingListNo != null': true,
                InvoiceType: this.data.invoiceType
            };

            this.data.amountCA = 0;

            var pl = await this.service.getInvoicePartial(filter);
            if (pl && pl.length > 0) {
                var itemsByPackingInvoice = [];
                var distinctPackingInvoiceNos = new Set(pl.map(item => item.packingListNo));

                var consignee = "";
                var TotalAmount = 0;
                var consignees = [];

                for (var packingInvoiceNo of distinctPackingInvoiceNos) {
                    var data = pl.filter(item => (item.packingListNo) === packingInvoiceNo);
                    for (var d of data) {
                        var itemDetails = [];
                        for (var e of d.items) {
                            var details = {
                                buyerCode: this.data.buyerAgent.code,
                                section: this.data.section.code,

                                packingListId: d.id,
                                packingListItemId: e.id,
                                packingInvoiceNo: d.packingListNo,
                                roNo: e.roNo,
                                scNo: e.scNo,
                                price: (d.invoiceType === 'DS' || d.invoiceType === 'SM') ? e.price : e.priceFOB,
                                priceRO: e.priceRO,
                                quantity: e.quantity,
                                cmtPrice: e.priceCMT,
                                comodity: {
                                    id: e.comodity.id,
                                    code: e.comodity.code,
                                    name: e.comodity.name
                                },
                                buyerBrand: {
                                    id: e.buyerBrand.id,
                                    code: e.buyerBrand.code,
                                    name: e.buyerBrand.name
                                },
                                uom: {
                                    id: e.uom.id,
                                    unit: e.uom.unit
                                },
                                unit: {
                                    id: e.unit.id,
                                    code: e.unit.code,
                                    name: e.unit.name
                                },
                                amount: e.amount,
                                currencyCode: e.valas,
                                comodityDesc: e.orderNo,
                                desc2: e.article,
                                desc3: d.colorJoin
                            };

                            consignee += e.buyerBrand.name;
                            if (consignees.length > 0) {
                                var dup = consignees.find(a => a == e.buyerBrand.name);
                                if (!dup) {
                                    consignees.push(e.buyerBrand.name);
                                }
                            } else {
                                consignees.push(e.buyerBrand.name);
                            }

                            TotalAmount += e.amount;
                            itemDetails.push(details);
                        }

                        var newItems = {
                            isSave: false,
                            isSelected: false,
                            packingInvoiceNo: packingInvoiceNo,
                            packingListType: d.packingListType,
                            invoiceType: d.invoiceType,
                            date: d.date,
                            packingListId: d.id,
                            details: d.items.length <= 0 ? [] : itemDetails
                        }

                        itemsByPackingInvoice.push(newItems);
                    }
                }

                this.data.consignee = consignees.join("\n");
                this.data.totalAmount = TotalAmount;
                this.data.packingListType = pl[0].packingListType;

                this.fabricType = null;
                this.data.itemsByPackingInvoice = itemsByPackingInvoice;
            } else {
                alert("Tidak ada Packing List yang dapat dipilih untuk Buyer/Seksi/Staff Shipping tersebut.");
            }
        }
    };

    packinglistColumnsPartial = {
        columns: [
            { header: "" },
            { header: "PackingList" },
        ],

        columnsItems: [
            "PackingList"
        ]
    };

    adjustmentColumns = {
        columns: [
            { header: "Penambahan/Pengurangan" },
            { header: "Nilai" },

        ],
        onAdd: function () {
            this.data.garmentShippingInvoiceAdjustments.push({
                adjustmentDescription: this.data.adjustmentDescription,
                adjustmentValue: this.data.adjustmentValue
            });
            this.data.garmentShippingInvoiceAdjustments.forEach((m, i) => m.MaterialIndex = i);
        }.bind(this),
        onRemove: function () {
            this.data.garmentShippingInvoiceAdjustments.forEach((m, i) => m.MaterialIndex = i);
        }.bind(this),
        options: {}
    };

    unitColumns = {
        columns: [
            { header: "Unit" },
            { header: "Jumlah (%)" },
            { header: "Amount (%)" },
        ],
    };

    get amountToBePaid() {
        var amountisCmt = 0;
        var amountAll = 0;
        var amountCMT = 0;

        // 1. Tentukan sumber items berdasarkan status partial
        let itemsToProcess = [];
        if (this.data.isPartial && this.data.itemsByPackingInvoice) {
            const savedGroups = this.data.itemsByPackingInvoice.filter(i => i.isSave);
            itemsToProcess = savedGroups.flatMap(group => group.details || []);
        }

        // 2. Hitung total dari items
        for (const item of itemsToProcess) {
            if (item.quantity) {
                amountAll += item.quantity * (item.price || 0) || 0;

                // Evaluasi cmtPrice secara tegas
                if (item.cmtPrice && item.cmtPrice > 0) {
                    amountisCmt += item.quantity * (item.price || 0);
                    amountCMT += item.quantity * item.cmtPrice;
                }
            }
        }

        // 3. Hitung total adjustment
        let adjustmentValue = 0;
        if (this.data.garmentShippingInvoiceAdjustments) {
            adjustmentValue = this.data.garmentShippingInvoiceAdjustments.reduce(
                (acc, curr) => acc + (curr.adjustmentValue || 0),
                0
            );
        }

        // 4. Hitung total akhir
        const totalAmount = amountAll - amountisCmt + amountCMT;
        const finalAmount = totalAmount + adjustmentValue;

        this.data.amountToBePaid = finalAmount;
        return finalAmount;
    };

    get totalAmounts() {
        var totalAmount = 0;

        if (this.data.isPartial) {
            if (this.data.itemsByPackingInvoice) {
                for (var itemGroup of this.data.itemsByPackingInvoice.filter(i => i.isSave)) {
                    for (var item of itemGroup.details) {
                        // if (item.amount > 0) {
                            totalAmount = totalAmount + (item.price * item.quantity);
                        // } else {
                        //     totalAmount = 0;
                        // }
                    }
                }
            } 
        }

        this.data.totalAmount = totalAmount;
        return totalAmount;
    };

    get lessFabricCosts() {
        var lessFabCost = 0;

        if (this.data.isPartial) {
            if (this.data.itemsByPackingInvoice) {
                for (var itemGroup of this.data.itemsByPackingInvoice.filter(i => i.isSave)) {
                    for (var item of itemGroup.details) {
                        if (item.cmtPrice > 0) {
                            lessFabCost += ((item.cmtPrice - item.price) * item.quantity);
                        }
                    }
                }
            }
        }

        this.lessFabCost = lessFabCost;
        return lessFabCost;
    };

    bankFilter = {
        DivisionName: "AMBASSADOR GARMINDO"
    };

    get isPackinglistType() {
        return this.data.packingListType && (this.data.packingListType == "EXPORT");
    };
}
