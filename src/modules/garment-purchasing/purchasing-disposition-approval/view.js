import { inject, TaskQueue } from "aurelia-framework";
import { Router } from "aurelia-router";
import { Service } from "./service";
import { Dialog } from "../../../au-components/dialog/dialog";
import { AuthService } from "aurelia-authentication";
import { RejectReason } from "./dialog-template/reject-reason";
import moment from 'moment';
import numeral from 'numeral';
import { Base64Helper } from '../../../utils/base-64-coded-helper';
import XLSX from 'xlsx';

numeral.defaultFormat("0,0.00");

@inject(Router, Service, Dialog, AuthService, TaskQueue)
export class View {
    readOnly = true;
    
    controlOptions = {
        label: {
            align: "right",
            length: 5,
        },
        control: {
            length: 5,
            align: "right",
        },
    };
    
    length4 = {
        label: {
            align: "left",
            length: 4
        }
    };
    length6 = {
        label: {
            align: "left",
            length: 6
        }
    };
    length7 = {
        label: {
            align: "left",
            length: 7
        }
    };

    formOptions = {
        cancelText: "Kembali",
        editText: "Approve",
        deleteText: "Reject"
    };

    itemsInfo = {
        columns: ["Tanggal", "Keterangan", "Jumlah", "Kena PPN", "PPh", "Total"],
        options: {}
    }

    constructor(router, service, dialog, authService, taskQueue) {
        this.router = router;
        this.service = service;
        this.dialog = dialog;
        this.authService = authService;
        this.previewWidth = 60;
        this.previewHeight = 600;
        this.taskQueue = taskQueue;
    }

    async activate(params, routeConfig, navigationInstruction) {
        const instruction = navigationInstruction.getAllInstructions()[0];
        const parentInstruction = instruction.parentInstruction;
        this.title = parentInstruction.config.title;
        const type = parentInstruction.config.settings.type;

        switch (type) {
            case "staff":
                this.type = "Staff";
                break;
            case "manager1":
                this.type = "Kasie";
                break;
            case "manager2":
                this.type = "Kabag";
                break;
            case "verification":
                this.type = "Verification";
                break;
            case "budget1":
                this.type = "Budget1";
                break;
            case "budget2":
                this.type = "Budget2";
                break;
            case "director":
                this.type = "Director";
                break;
            default: break;
        }

        if (this.authService.authenticated) {
            this.me = this.authService.getTokenPayload();
        }
        else {
            this.me = null;
        }

        const decoded = Base64Helper.decode(params.id);
        var id = decoded;
        this.data = await this.service.getById(id);
        this.error = {};

        // Setup options for templates
        if (!this.itemsInfo.options) {
            this.itemsInfo.options = {};
        }
        this.itemsInfo.options.readOnly = this.readOnly;
        this.itemsInfo.options.isEdit = true;
        
        if (this.data.Currency) {
            this.itemsInfo.options.CurrencyCode = this.data.Currency.Code;
        }

        this.data.DocumentsFile = this.data.DocumentsFile || [];
        this.data.DocumentsFileName = this.data.DocumentsFileName || [];
        this.documentsPathTemp = [].concat(this.data.DocumentsPath);
    
        if (this.data.DispositionDate) {
            this.data.DispositionDateFormatted = moment(this.data.DispositionDate).format("DD MMMM YYYY");
        }

        this.editCallback = this.approve;
        this.deleteCallback = this.reject;
    }

    async bind(context) {
        this.context = context;
    }

    list() {
        this.router.navigateToRoute("list");
    }

    cancelCallback(event) {
        this.list();
    }

    approve(event) {
        if (confirm("Approve Disposition?")) {
            const approvalData = {
                [`IsApproved${this.type}`]: true,
                [`Approved${this.type}By`]: this.me.username,
                [`Approved${this.type}Date`]: new Date().toISOString()
            };

            this.service.replace(this.data.Id, approvalData)
                .then(result => {
                    alert("Disposition berhasil di-approve.");
                    this.list();
                })
                .catch(e => {
                    this.error = e;
                    if (e.statusCode === 500) {
                        alert("Gagal menyimpan, silakan coba lagi!");
                    }
                });
        }
    }

    reject(event) {
       this.dialog.show(RejectReason, {message: "Silakan masukkan alasan reject:" })
        .then(response => {
        if (!response.wasCancelled) {
            const reason = response.output;
            if (!reason || String(reason).trim() === "") {
            alert('Alasan tidak boleh kosong.');
            return;
            }
            this.service
            .Rejected(this.data.Id, String(reason).trim())
            .then((result) => {
                this.list();
            })
            .catch((e) => {
                this.error = e;
            });
        }
        });
    }

    downloadDocument(index) {
        const linkSource = this.data.DocumentsFile && this.data.DocumentsFile[index];
        const fileName = (this.data.DocumentsFileName && this.data.DocumentsFileName[index]) || 'document';
        if (!linkSource || (typeof linkSource === 'string' && linkSource.trim() === '')) {
            alert('File dokumen tidak tersedia.');
            return;
        }
        const downloadLink = document.createElement("a");
        downloadLink.href = linkSource;
        downloadLink.download = fileName;
        downloadLink.click();
    }

    //atur review dan ukuran pop up
    updatePreviewSize() {
            const modalDialog = document.querySelector('#pdfPreviewModal .modal-dialog');
            const embed = document.getElementById('pdfEmbed');
            const excelDiv = document.getElementById('excelTable');
            const imagePreview = document.getElementById('imagePreview');
            
            if (modalDialog) {
                modalDialog.style.width = `${this.previewWidth}%`;
                modalDialog.style.maxWidth = `${this.previewWidth}%`;
            }
            if (embed) {
                embed.style.height = `${this.previewHeight}px`;
            }
            if (excelDiv) {
                excelDiv.style.maxHeight = `${this.previewHeight}px`;
            }
            if (imagePreview) {
                imagePreview.style.maxHeight = `${this.previewHeight}px`;
            }
        }
    
        initResizable() {
            const modal = document.getElementById('pdfPreviewModal');
            if (!modal) return;
            const handles = modal.querySelectorAll('.resize-handle');         
            handles.forEach(handle => {
                handle.addEventListener('mousedown', (e) => {
                    e.preventDefault();
                    this.isResizing = true;
                    this.resizeDirection = handle.dataset.direction;
                    this.startX = e.clientX;
                    this.startY = e.clientY;
                    
                    const modalDialog = modal.querySelector('.modal-dialog');
                    const rect = modalDialog.getBoundingClientRect();
                    this.startWidth = rect.width;
                    this.startHeight = this.previewHeight;
                    
                    document.addEventListener('mousemove', this.handleResize);
                    document.addEventListener('mouseup', this.stopResize);
                    
                    modalDialog.style.transition = 'none';
                });
            });
        }
    
        handleResize = (e) => {
            if (!this.isResizing) return;
            
            const deltaX = e.clientX - this.startX;
            const deltaY = e.clientY - this.startY;
            const modalDialog = document.querySelector('#pdfPreviewModal .modal-dialog');
            
            if (this.resizeDirection.includes('e')) {
                const newWidth = this.startWidth + deltaX;
                const windowWidth = window.innerWidth;
                const widthPercent = Math.max(30, Math.min(100, (newWidth / windowWidth) * 100));
                this.previewWidth = Math.round(widthPercent);
            }
            
            if (this.resizeDirection.includes('w')) {
                const newWidth = this.startWidth - deltaX;
                const windowWidth = window.innerWidth;
                const widthPercent = Math.max(30, Math.min(100, (newWidth / windowWidth) * 100));
                this.previewWidth = Math.round(widthPercent);
            }
            
            if (this.resizeDirection.includes('s')) {
                const newHeight = this.startHeight + deltaY;
                this.previewHeight = Math.max(300, Math.min(1000, Math.round(newHeight)));
            }
            
            if (this.resizeDirection.includes('n')) {
                const newHeight = this.startHeight - deltaY;
                this.previewHeight = Math.max(300, Math.min(1000, Math.round(newHeight)));
            }
            
            this.updatePreviewSize();
        }
    
        stopResize = () => {
            if (this.isResizing) {
                this.isResizing = false;
                this.resizeDirection = null;
                
                const modalDialog = document.querySelector('#pdfPreviewModal .modal-dialog');
                if (modalDialog) {
                    modalDialog.style.transition = '';
                }
                document.removeEventListener('mousemove', this.handleResize);
                document.removeEventListener('mouseup', this.stopResize);
            }
        }
    
        revokePreviewBlobUrl() {
            if (this._previewBlobUrl) {
                URL.revokeObjectURL(this._previewBlobUrl);
                this._previewBlobUrl = null;
            }
        }

        decodeDataUrl(fileUrl) {
            if (typeof fileUrl !== 'string') {
                return null;
            }
            const trimmed = fileUrl.trim();
            if (!trimmed) {
                return null;
            }
            if (trimmed.startsWith('data:')) {
                const commaIndex = trimmed.indexOf(',');
                if (commaIndex === -1) {
                    return null;
                }
                const header = trimmed.substring(5, commaIndex);
                if (!header.toLowerCase().includes(';base64')) {
                    return null;
                }
                const mimeType = header.split(';')[0] || 'application/octet-stream';
                return this.decodeBase64Payload(trimmed.substring(commaIndex + 1), mimeType);
            }
            if (!/^(https?:|blob:|\/)/i.test(trimmed)) {
                return this.decodeBase64Payload(trimmed, 'application/octet-stream');
            }
            return null;
        }

        decodeBase64Payload(base64Data, mimeType) {
            try {
                const binary = atob(base64Data.replace(/\s+/g, ''));
                const bytes = new Uint8Array(binary.length);
                for (let i = 0; i < binary.length; i++) {
                    bytes[i] = binary.charCodeAt(i);
                }
                return { mimeType, bytes };
            } catch (error) {
                console.error('Error decoding base64 document:', error);
                return null;
            }
        }

        buildPreviewUrl(fileUrl, overrideMimeType) {
            if (!fileUrl) {
                return null;
            }
            const decoded = this.decodeDataUrl(fileUrl);
            if (decoded) {
                this.revokePreviewBlobUrl();
                const blobType = overrideMimeType || decoded.mimeType || 'application/octet-stream';
                this._previewBlobUrl = URL.createObjectURL(new Blob([decoded.bytes], { type: blobType }));
                return this._previewBlobUrl;
            }
            if (typeof fileUrl === 'string' && fileUrl.trim().startsWith('data:')) {
                return null;
            }
            return fileUrl;
        }

        renderExcelFromBuffer(buffer, excelDiv) {
            const workbook = XLSX.read(buffer, { type: 'array' });
            const sheetName = workbook.SheetNames[0];
            if (!sheetName) {
                excelDiv.innerHTML = '<p>Sheet Excel kosong.</p>';
                return;
            }
            const worksheet = workbook.Sheets[sheetName];
            const html = XLSX.utils.sheet_to_html(worksheet);
            excelDiv.innerHTML = html.replace('<table', '<table class="table table-bordered table-striped table-condensed"');
        }

        openPreviewModal(elements, title, activeMode) {
            const { embed, excelDiv, imagePreview, modalLabel } = elements;
            modalLabel.innerText = title;
            embed.style.display = activeMode === 'pdf' ? 'block' : 'none';
            excelDiv.style.display = activeMode === 'excel' ? 'block' : 'none';
            imagePreview.style.display = activeMode === 'image' ? 'block' : 'none';

            this.updatePreviewSize();
            $('#pdfPreviewModal')
                .off('hidden.bs.modal.docPreview')
                .on('hidden.bs.modal.docPreview', () => {
                    embed.removeAttribute('src');
                    imagePreview.removeAttribute('src');
                    this.revokePreviewBlobUrl();
                })
                .modal('show');
            setTimeout(() => this.initResizable(), 100);
        }

        previewDocument(index) {
            const rawFileUrl = this.data.DocumentsFile && this.data.DocumentsFile[index];
            const fileName = (this.data.DocumentsFileName && this.data.DocumentsFileName[index]) || '';
            const embed = document.getElementById('pdfEmbed');
            const excelDiv = document.getElementById('excelTable');
            const imagePreview = document.getElementById('imagePreview');
            const modalLabel = document.getElementById('previewModalLabel');

            if (!embed || !excelDiv || !imagePreview || !modalLabel) {
                return;
            }

            if (!rawFileUrl || (typeof rawFileUrl === 'string' && rawFileUrl.trim() === '')) {
                embed.removeAttribute('src');
                imagePreview.removeAttribute('src');
                this.revokePreviewBlobUrl();
                alert('File dokumen tidak tersedia untuk preview.');
                return;
            }

            const elements = { embed, excelDiv, imagePreview, modalLabel };
            const lowerFileName = fileName.toLowerCase();

            if (lowerFileName.endsWith('.pdf')) {
                const previewUrl = this.buildPreviewUrl(rawFileUrl, 'application/pdf');
                if (!previewUrl) {
                    alert('Format file PDF tidak valid.');
                    return;
                }
                imagePreview.removeAttribute('src');
                embed.src = previewUrl;
                this.openPreviewModal(elements, 'Preview PDF', 'pdf');
                return;
            }

            if (lowerFileName.endsWith('.xlsx') || lowerFileName.endsWith('.xls')) {
                embed.removeAttribute('src');
                imagePreview.removeAttribute('src');
                this.revokePreviewBlobUrl();
                excelDiv.innerHTML = '<p>Loading Excel...</p>';
                this.openPreviewModal(elements, 'Preview Excel', 'excel');

                const decoded = this.decodeDataUrl(rawFileUrl);
                if (decoded) {
                    try {
                        this.renderExcelFromBuffer(decoded.bytes, excelDiv);
                    } catch (error) {
                        excelDiv.innerHTML = '<p>Error loading Excel file.</p>';
                        console.error('Error parsing Excel:', error);
                    }
                    return;
                }

                fetch(rawFileUrl)
                    .then(response => response.arrayBuffer())
                    .then(data => this.renderExcelFromBuffer(data, excelDiv))
                    .catch(error => {
                        excelDiv.innerHTML = '<p>Error loading Excel file.</p>';
                        console.error('Error fetching or parsing Excel:', error);
                    });
                return;
            }

            const imageMimeByExt = {
                '.jpg': 'image/jpeg',
                '.jpeg': 'image/jpeg',
                '.png': 'image/png',
                '.gif': 'image/gif',
                '.bmp': 'image/bmp',
                '.webp': 'image/webp'
            };
            const matchedExt = Object.keys(imageMimeByExt).find(ext => lowerFileName.endsWith(ext));
            if (matchedExt) {
                const previewUrl = this.buildPreviewUrl(rawFileUrl, imageMimeByExt[matchedExt]);
                if (!previewUrl) {
                    alert('Format file gambar tidak valid.');
                    return;
                }
                embed.removeAttribute('src');
                imagePreview.src = previewUrl;
                this.openPreviewModal(elements, 'Preview Image', 'image');
                return;
            }

            alert('Preview not supported for this file type.');
        }
}