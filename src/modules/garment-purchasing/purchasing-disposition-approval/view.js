import { inject, TaskQueue } from "aurelia-framework";
import { Router } from "aurelia-router";
import { Service } from "./service";
import { Dialog } from "../../../au-components/dialog/dialog";
import { AuthService } from "aurelia-authentication";
import { RejectReason } from "./dialog-template/reject-reason";
import moment from 'moment';
import numeral from 'numeral';
import { Base64Helper } from '../../../utils/base-64-coded-helper';

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
      const linkSource = this.data.DocumentsFile[index];
      const downloadLink = document.createElement("a");
      const fileName = this.data.DocumentsFileName[index];

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
    
        previewDocument(index) {
            const fileUrl = this.data.DocumentsFile[index];
            const fileName = this.data.DocumentsFileName[index];
            const embed = document.getElementById('pdfEmbed');
            const excelDiv = document.getElementById('excelTable');
            const imagePreview = document.getElementById('imagePreview');
            const modalLabel = document.getElementById('previewModalLabel');
    
            const lowerFileName = fileName.toLowerCase();
            if (lowerFileName.endsWith('.pdf')) {
                modalLabel.innerText = 'Preview PDF';
                embed.src = fileUrl;
                embed.style.display = 'block';
                excelDiv.style.display = 'none';
                imagePreview.style.display = 'none';
                this.updatePreviewSize();
                $('#pdfPreviewModal').modal('show');
                setTimeout(() => this.initResizable(), 100);
            } else if (lowerFileName.endsWith('.xlsx') || lowerFileName.endsWith('.xls')) {
                modalLabel.innerText = 'Preview Excel';
                embed.style.display = 'none';
                excelDiv.style.display = 'block';
                imagePreview.style.display = 'none';
                excelDiv.innerHTML = '<p>Loading Excel...</p>';
    
                fetch(fileUrl)
                    .then(response => response.arrayBuffer())
                    .then(data => {
                        const workbook = XLSX.read(data, { type: 'array' });
                        const sheetName = workbook.SheetNames[0];
                        const worksheet = workbook.Sheets[sheetName];
                        const html = XLSX.utils.sheet_to_html(worksheet);
                        excelDiv.innerHTML = html;
                    })
                    .catch(error => {
                        excelDiv.innerHTML = '<p>Error loading Excel file.</p>';
                        console.error('Error fetching or parsing Excel:', error);
                    });
    
                this.updatePreviewSize();
                $('#pdfPreviewModal').modal('show');
                setTimeout(() => this.initResizable(), 100);
            } else if (lowerFileName.endsWith('.jpg') || lowerFileName.endsWith('.jpeg') || lowerFileName.endsWith('.png') || lowerFileName.endsWith('.gif') || lowerFileName.endsWith('.bmp') || lowerFileName.endsWith('.webp')) {
                modalLabel.innerText = 'Preview Image';
                imagePreview.src = fileUrl;
                embed.style.display = 'none';
                excelDiv.style.display = 'none';
                imagePreview.style.display = 'block';
                this.updatePreviewSize();
                $('#pdfPreviewModal').modal('show');
                setTimeout(() => this.initResizable(), 100);
            } else {
                alert('Preview not supported for this file type.');
            }
        }
}