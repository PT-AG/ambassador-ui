import { inject, bindable } from 'aurelia-framework';
import { Router } from 'aurelia-router';
import { Service } from '../service';

@inject(Router, Service)
export class Upload {
	@bindable error = {};
	@bindable onResult; // callback optional untuk mengirim hasil ke parent
	formOptions = { label: { length: 3 }, control: { length: 9 } };

	constructor(router, service) {
		this.router = router;
		this.service = service;
		this.selectedFile = null;
		this.disabled = false;
	this.success = false;
	this.isScanning = false; // for loader overlay
	}

	// Saat dipanggil via <compose model.bind="{ onResult: handleUploadResult }">
	activate(model) {
		if (model && typeof model.onResult === 'function') {
			this.onResult = model.onResult;
		}
		if (model && typeof model.onFileSelected === 'function') {
			this.onFileSelected = model.onFileSelected;
		}
	}

	onFileChanged(evt) {
		this.error = {};
		const file = evt && evt.target && evt.target.files && evt.target.files[0];
		this.selectedFile = file || null;
		if (file && file.type !== 'application/pdf') {
			// Some browsers may not set type accurately; keep a light check
			const name = (file.name ? file.name.toLowerCase() : '') || '';
			if (!name.endsWith('.pdf')) {
				this.error.file = 'Hanya file PDF yang diperbolehkan';
				this.selectedFile = null;
			}
		}
		if (typeof this.onFileSelected === 'function') {
			this.onFileSelected(this.selectedFile);
		}
	}

	cancel() {
		this.router.navigateToRoute('list');
	}

	async upload() {
		this.error = {};
		if (!this.selectedFile) {
			this.error.file = 'File harus dipilih';
			return;
		}
		try {
			this.disabled = true;
			this.isScanning = true;
			const result = await this.service.uploadFile(this.selectedFile);
			// Tampilkan alert dan hanya lanjut setelah OK ditekan
			alert('Hasil Scan Dokumen Berhasil');
			// kirim ke parent jika callback tersedia (setelah OK)
			if (typeof this.onResult === 'function') {
				try { this.onResult(result); } catch (_) { /* noop */ }
			}
			return result;
		} catch (e) {
			this.error.upload = e.message || 'Gagal upload file';
		} finally {
			this.disabled = false;
			this.isScanning = false;
		}
	}

	clear() {
		this.error = {};
		this.success = false;
		this.selectedFile = null;
		// reset elemen file input
		if (this.fileInput) {
			this.fileInput.value = '';
		}
		// beritahu parent untuk mengosongkan hasil
		if (typeof this.onResult === 'function') {
			try { this.onResult(null); } catch (_) { /* noop */ }
		}
        // beritahu parent untuk mengosongkan file yang dipilih
        if (typeof this.onFileSelected === 'function') {
            try { this.onFileSelected(null); } catch (_) { /* noop */ }
        }
	}
}

export default Upload;
