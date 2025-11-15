/**
 * APLIKASI TRACKING PENGIRIMAN DELIVERY ORDER
 * 
 * Aplikasi Vue.js untuk mengelola dan melacak pengiriman bahan ajar
 * dengan fitur auto-generate nomor DO, tracking real-time, dan progress visualization
 */
var app = new Vue ({
  el: '#trackingApp',
  data: {
      // Daftar paket bahan ajar yang tersedia
      paket: [
        { kode: "PAKET-UT-001", nama: "PAKET IPS Dasar", isi: ["EKMA4116","EKMA4115"], harga: 120000 },
        { kode: "PAKET-UT-002", nama: "PAKET IPA Dasar", isi: ["BIOL4201","FISIP4001"], harga: 140000 }
      ],
      
      // Database tracking DO (dalam aplikasi production gunakan backend API)
      tracking: {
        "DO2025-0001": {
          nim: "123456789",
          nama: "Rina Wulandari",
          status: "Dalam Perjalanan",
          ekspedisi: "JNE",
          tanggalKirim: "2025-08-25",
          paket: "PAKET-UT-001",
          total: 120000,
          perjalanan: [
            { waktu: "2025-08-25 10:12:20", keterangan: "Penerimaan di Loket: TANGSEL" },
            { waktu: "2025-08-25 14:07:56", keterangan: "Tiba di Hub: JAKSEL" },
            { waktu: "2025-08-26 08:44:01", keterangan: "Diteruskan ke Kantor Tujuan" }
          ]
        }
      },
      
      // Form data untuk DO baru
      formDO: {
        nim: "",
        nama: "",
        ekspedisi: "",
        paketKode: "",
        tanggalKirim: new Date().toISOString().split('T')[0],
        total: 0
      },
      
      // State untuk pencarian dan hasil tracking
      cariNoDO: "",
      hasilTracking: null
  },
  computed: {
    /**
     * Generate nomor DO baru secara otomatis
     * Format: DO{TAHUN}-{URUTAN_4_DIGIT}
     * Contoh: DO2025-0001
     * @returns {string} Nomor DO yang sudah digenerate
     */
    nomorDOBaru() {
      const tahun = new Date().getFullYear();
      const keys = Object.keys(this.tracking);
      const lastNum = keys.length > 0 ? parseInt(keys[keys.length - 1].split('-')[1]) : 0;
      const nextNum = String(lastNum + 1).padStart(4, '0');
      return `DO${tahun}-${nextNum}`;
    },
    
    /**
     * Mendapatkan detail paket yang dipilih user di form
     * Digunakan untuk menampilkan isi paket secara otomatis
     * @returns {Object|undefined} Object paket atau undefined jika belum dipilih
     */
    paketTerpilih() {
      return this.paket.find(p => p.kode === this.formDO.paketKode);
    },
    
    /**
     * Menghitung persentase progress pengiriman berdasarkan status terakhir
     * Mapping status ke persentase:
     * - Selesai antar: 100%
     * - Proses antar: 80%
     * - Tiba di hub: 60%
     * - Penerimaan di loket: 30%
     * - Default: 40%
     * @returns {number} Persentase progress (0-100)
     */
    progressPersen() {
      if (!this.hasilTracking) return 0;
      const perjalanan = this.hasilTracking.perjalanan || [];
      if (!perjalanan.length) return 10;
      
      const last = (perjalanan[perjalanan.length - 1]?.keterangan || '').toLowerCase();
      if (last.includes('selesai antar')) return 100;
      if (last.includes('proses antar')) return 80;
      if (last.includes('tiba di hub')) return 60;
      if (last.includes('penerimaan di loket')) return 30;
      return 40;
    },
    
    /**
     * Menentukan warna progress bar berdasarkan persentase
     * - 100%: success (hijau)
     * - >= 80%: primary (biru)
     * - >= 60%: info (cyan)
     * - < 60%: secondary (abu-abu)
     * @returns {string} Class Bootstrap untuk warna progress bar
     */
    progressBar() {
      const p = this.progressPersen;
      if (p === 100) return 'bg-success';
      if (p >= 80) return 'bg-primary';
      if (p >= 60) return 'bg-info';
      return 'bg-secondary';
    },
    
    /**
     * Menentukan warna badge status berdasarkan progress pengiriman
     * - 100%: success (hijau)
     * - >= 60%: warning (kuning)
     * - < 60%: secondary (abu-abu)
     * @returns {string} Class Bootstrap untuk badge status
     */
    statusBadge() {
      const p = this.progressPersen;
      if (p === 100) return 'bg-success';
      if (p >= 60) return 'bg-warning';
      return 'bg-secondary';
    }
  },
  watch: {
    /**
     * Watcher untuk paketKode di form
     * Otomatis mengupdate total harga ketika user memilih paket
     * @param {string} newVal - Kode paket yang baru dipilih
     */
    'formDO.paketKode'(newVal) {
      const paket = this.paket.find(p => p.kode === newVal);
      this.formDO.total = paket ? paket.harga : 0;
    }
  },
  methods: {
    /**
     * Format angka menjadi format rupiah Indonesia
     * @param {number} angka - Angka yang akan diformat
     * @returns {string} String rupiah dengan format "Rp 123.456"
     */
    formatRupiah(angka) {
      return 'Rp ' + angka.toLocaleString('id-ID');
    },
    
    /**
     * Menambahkan Delivery Order baru ke dalam sistem
     * - Generate nomor DO otomatis
     * - Simpan data DO ke database tracking
     * - Buat entry perjalanan pertama
     * - Reset form setelah berhasil
     */
    tambahDO() {
      const noDO = this.nomorDOBaru;
      const paket = this.paket.find(p => p.kode === this.formDO.paketKode);
      
      // Simpan DO baru ke tracking database
      this.tracking[noDO] = {
        nim: this.formDO.nim,
        nama: this.formDO.nama,
        status: "Diproses",
        ekspedisi: this.formDO.ekspedisi,
        tanggalKirim: this.formDO.tanggalKirim,
        paket: paket ? paket.nama : "",
        total: this.formDO.total,
        perjalanan: [
          { waktu: new Date().toLocaleString('id-ID'), keterangan: "DO dibuat" }
        ]
      };
      
      alert('DO berhasil ditambahkan: ' + noDO);
      this.resetForm();
    },
    
    /**
     * Mereset form DO ke kondisi awal (kosong)
     * Mengembalikan semua field ke nilai default
     * Tanggal kirim di-set ke hari ini
     */
    resetForm() {
      this.formDO = {
        nim: "",
        nama: "",
        ekspedisi: "",
        paketKode: "",
        tanggalKirim: new Date().toISOString().split('T')[0],
        total: 0
      };
    },
    
    /**
     * Mencari dan menampilkan detail tracking DO berdasarkan nomor
     * Jika ditemukan, data ditampilkan dengan progress dan timeline
     * Jika tidak ditemukan, hasilTracking di-set null (alert akan muncul)
     */
    cariDO() {
      const data = this.tracking[this.cariNoDO];
      this.hasilTracking = data ? { ...data, noDO: this.cariNoDO } : null;
    }
  }
});