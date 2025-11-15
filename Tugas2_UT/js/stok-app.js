/**
 * APLIKASI MANAJEMEN STOK BAHAN AJAR
 * 
 * Aplikasi Vue.js untuk mengelola stok bahan ajar Universitas Terbuka
 * dengan fitur filter, sorting, edit inline, dan tambah data baru
 */
var app = new Vue ({
  el: '#stokApp',
  data: {
      // Daftar UPBJJ (Unit Program Belajar Jarak Jauh)
      upbjjList: ["Jakarta", "Surabaya", "Makassar", "Padang", "Denpasar"],
      
      // Daftar kategori mata kuliah
      kategoriList: ["MK Wajib", "MK Pilihan", "Praktikum", "Problem-Based"],
      
      // Daftar jenis pengiriman
      pengirimanList: [
        { kode: "REG", nama: "Reguler (3-5 hari)" },
        { kode: "EXP", nama: "Ekspres (1-2 hari)" }
      ],
      
      // Daftar paket bahan ajar
      paket: [
        { kode: "PAKET-UT-001", nama: "PAKET IPS Dasar", isi: ["EKMA4116","EKMA4115"], harga: 120000 },
        { kode: "PAKET-UT-002", nama: "PAKET IPA Dasar", isi: ["BIOL4201","FISIP4001"], harga: 140000 }
      ],
      
      // Data stok bahan ajar
      stok: [
        {
          kode: "EKMA4116",
          judul: "Pengantar Manajemen",
          kategori: "MK Wajib",
          upbjj: "Jakarta",
          lokasiRak: "R1-A3",
          harga: 65000,
          qty: 28,
          safety: 20,
          catatanHTML: "<em>Edisi 2024, cetak ulang</em>"
        },
        {
          kode: "EKMA4115",
          judul: "Pengantar Akuntansi",
          kategori: "MK Wajib",
          upbjj: "Jakarta",
          lokasiRak: "R1-A4",
          harga: 60000,
          qty: 7,
          safety: 15,
          catatanHTML: "<strong>Cover baru</strong>"
        },
        {
          kode: "BIOL4201",
          judul: "Biologi Umum (Praktikum)",
          kategori: "Praktikum",
          upbjj: "Surabaya",
          lokasiRak: "R3-B2",
          harga: 80000,
          qty: 12,
          safety: 10,
          catatanHTML: "Butuh <u>pendingin</u> untuk kit basah"
        },
        {
          kode: "FISIP4001",
          judul: "Dasar-Dasar Sosiologi",
          kategori: "MK Pilihan",
          upbjj: "Makassar",
          lokasiRak: "R2-C1",
          harga: 55000,
          qty: 2,
          safety: 8,
          catatanHTML: "Stok <i>menipis</i>, prioritaskan reorder"
        }
      ],
      
      // State untuk filter dan sorting
      filterUpbjj: "",
      filterKategori: "",
      filterStokKritis: "",
      sortBy: "",
      
      // State untuk mode edit
      editIndex: null,
      editData: {},
      
      // State untuk form tambah bahan ajar baru
      showFormTambah: false,
      formTambah: {
        kode: "",
        judul: "",
        kategori: "",
        upbjj: "",
        lokasiRak: "",
        harga: "",
        qty: "",
        safety: "",
        catatanHTML: ""
      },
      
      // State untuk error validasi
      errorKode: "",
      errorJudul: "",
      errorHarga: "",
      errorQty: "",
      errorSafety: ""
  },
  computed: {
    /**
     * Menampilkan daftar kategori yang tersedia berdasarkan UPBJJ yang dipilih
     * Implementasi dependent dropdown (kategori bergantung pada pilihan UPBJJ)
     * @returns {Array} Daftar kategori unik untuk UPBJJ terpilih
     */
    availableKategori: function() {
      if (!this.filterUpbjj) return [];
      var filtered = this.stok.filter(function(s) {
        return s.upbjj === this.filterUpbjj;
      }.bind(this));
      var kategoriSet = filtered.map(function(s) { return s.kategori; });
      return Array.from(new Set(kategoriSet));
    },
    
    /**
     * Mengembalikan data stok yang sudah difilter dan disortir
     * Menerapkan filter berdasarkan UPBJJ, kategori, dan status stok
     * Kemudian mengurutkan data sesuai pilihan user
     * @returns {Array} Array data stok yang sudah difilter dan disortir
     */
    stokFiltered: function() {
      var hasil = this.stok;

      // Filter berdasarkan UPBJJ
      if (this.filterUpbjj) {
        hasil = hasil.filter(function(s) {
          return s.upbjj === this.filterUpbjj;
        }.bind(this));
      }

      // Filter berdasarkan kategori
      if (this.filterKategori) {
        hasil = hasil.filter(function(s) {
          return s.kategori === this.filterKategori;
        }.bind(this));
      }

      // Filter berdasarkan status stok (kritis atau habis)
      if (this.filterStokKritis === 'kritis') {
        hasil = hasil.filter(function(s) { return s.qty < s.safety; });
      } else if (this.filterStokKritis === 'habis') {
        hasil = hasil.filter(function(s) { return s.qty === 0; });
      }

      // Sorting data
      if (this.sortBy === 'judul') {
        hasil = hasil.slice().sort(function(a, b) { 
          return a.judul.localeCompare(b.judul); 
        });
      } else if (this.sortBy === 'qty') {
        hasil = hasil.slice().sort(function(a, b) { return a.qty - b.qty; });
      } else if (this.sortBy === 'harga') {
        hasil = hasil.slice().sort(function(a, b) { return a.harga - b.harga; });
      }

      return hasil;
    }
  },
  methods: {
    /**
     * Mereset semua filter dan sorting ke nilai default
     * Mengembalikan tampilan ke kondisi awal (menampilkan semua data)
     */
    resetFilter: function() {
      this.filterUpbjj = "";
      this.filterKategori = "";
      this.filterStokKritis = "";
      this.sortBy = "";
    },
    
    /**
     * Memulai mode edit untuk item stok tertentu
     * Menyimpan index dan membuat copy data ke editData untuk temporary storage
     * @param {number} index - Index item yang akan diedit dalam array stok
     */
    mulaiEdit: function(index) {
      this.editIndex = index;
      this.editData = Object.assign({}, this.stok[index]);
    },
    
    /**
     * Menyimpan perubahan edit ke data stok asli
     * Mengupdate item stok dengan data dari editData
     * @param {number} index - Index item yang disimpan dalam array stok
     */
    simpanEdit: function(index) {
      Object.assign(this.stok[index], this.editData);
      this.batalEdit();
    },
    
    /**
     * Membatalkan mode edit dan mereset state edit
     * Menghapus editIndex dan editData untuk keluar dari mode edit
     */
    batalEdit: function() {
      this.editIndex = null;
      this.editData = {};
    },
    
    /**
     * Toggle tampilan form tambah bahan ajar
     * Menampilkan atau menyembunyikan form input
     */
    toggleFormTambah: function() {
      this.showFormTambah = !this.showFormTambah;
      if (!this.showFormTambah) {
        this.resetFormTambah();
      }
    },
    
    /**
     * Validasi kode mata kuliah
     * - Tidak boleh kosong
     * - Tidak boleh duplikat
     * - Format harus huruf kapital dan angka
     * @returns {boolean} True jika valid, false jika tidak
     */
    validasiKode: function() {
      this.errorKode = "";
      var kode = this.formTambah.kode.trim().toUpperCase();
      
      if (!kode) {
        this.errorKode = "Kode mata kuliah wajib diisi";
        return false;
      }
      
      if (!/^[A-Z0-9]+$/.test(kode)) {
        this.errorKode = "Kode hanya boleh huruf kapital dan angka";
        return false;
      }
      
      var isDuplicate = this.stok.some(function(s) {
        return s.kode === kode;
      });
      
      if (isDuplicate) {
        this.errorKode = "Kode mata kuliah sudah ada";
        return false;
      }
      
      return true;
    },
    
    /**
     * Validasi nama mata kuliah
     * - Tidak boleh kosong
     * - Minimal 3 karakter
     * @returns {boolean} True jika valid, false jika tidak
     */
    validasiJudul: function() {
      this.errorJudul = "";
      var judul = this.formTambah.judul.trim();
      
      if (!judul) {
        this.errorJudul = "Nama mata kuliah wajib diisi";
        return false;
      }
      
      if (judul.length < 3) {
        this.errorJudul = "Nama minimal 3 karakter";
        return false;
      }
      
      return true;
    },
    
    /**
     * Validasi harga
     * - Harus lebih dari 0
     * - Maksimal 1.000.000
     * @returns {boolean} True jika valid, false jika tidak
     */
    validasiHarga: function() {
      this.errorHarga = "";
      var harga = parseInt(this.formTambah.harga);
      
      if (!harga || harga <= 0) {
        this.errorHarga = "Harga harus lebih dari 0";
        return false;
      }
      
      if (harga > 1000000) {
        this.errorHarga = "Harga maksimal Rp 1.000.000";
        return false;
      }
      
      return true;
    },
    
    /**
     * Validasi jumlah stok
     * - Tidak boleh negatif
     * @returns {boolean} True jika valid, false jika tidak
     */
    validasiQty: function() {
      this.errorQty = "";
      var qty = parseInt(this.formTambah.qty);
      
      if (isNaN(qty) || qty < 0) {
        this.errorQty = "Stok tidak boleh negatif";
        return false;
      }
      
      return true;
    },
    
    /**
     * Validasi safety stock
     * - Harus lebih dari 0
     * - Tidak boleh lebih dari 1000
     * @returns {boolean} True jika valid, false jika tidak
     */
    validasiSafety: function() {
      this.errorSafety = "";
      var safety = parseInt(this.formTambah.safety);
      
      if (!safety || safety <= 0) {
        this.errorSafety = "Safety stock harus lebih dari 0";
        return false;
      }
      
      if (safety > 1000) {
        this.errorSafety = "Safety stock maksimal 1000";
        return false;
      }
      
      return true;
    },
    
    /**
     * Menambahkan bahan ajar baru ke dalam sistem
     * - Validasi semua input
     * - Simpan data ke array stok
     * - Reset form dan tutup setelah berhasil
     */
    tambahBahanAjar: function() {
      console.log('Form data:', this.formTambah); // Debug
      
      // Validasi field select (kategori dan upbjj)
      if (!this.formTambah.kategori) {
        alert('Pilih kategori mata kuliah');
        return;
      }
      
      if (!this.formTambah.upbjj) {
        alert('Pilih UT-Daerah');
        return;
      }
      
      if (!this.formTambah.lokasiRak.trim()) {
        alert('Lokasi rak wajib diisi');
        return;
      }
      
      // Jalankan semua validasi
      var isKodeValid = this.validasiKode();
      var isJudulValid = this.validasiJudul();
      var isHargaValid = this.validasiHarga();
      var isQtyValid = this.validasiQty();
      var isSafetyValid = this.validasiSafety();
      
      // Jika ada yang tidak valid, stop proses
      if (!isKodeValid || !isJudulValid || !isHargaValid || !isQtyValid || !isSafetyValid) {
        alert('Harap perbaiki kesalahan pada form');
        return;
      }
      
      // Tambahkan data baru ke array stok
      var dataBaru = {
        kode: this.formTambah.kode.trim().toUpperCase(),
        judul: this.formTambah.judul.trim(),
        kategori: this.formTambah.kategori,
        upbjj: this.formTambah.upbjj,
        lokasiRak: this.formTambah.lokasiRak.trim(),
        harga: parseInt(this.formTambah.harga),
        qty: parseInt(this.formTambah.qty),
        safety: parseInt(this.formTambah.safety),
        catatanHTML: this.formTambah.catatanHTML.trim()
      };
      
      console.log('Data baru:', dataBaru); // Debug
      this.stok.push(dataBaru);
      
      alert('Bahan ajar berhasil ditambahkan!');
      this.resetFormTambah();
      this.showFormTambah = false;
    },
    
    /**
     * Mereset form tambah bahan ajar ke kondisi awal
     * Menghapus semua input dan error message
     */
    resetFormTambah: function() {
      this.formTambah = {
        kode: "",
        judul: "",
        kategori: "",
        upbjj: "",
        lokasiRak: "",
        harga: "",
        qty: "",
        safety: "",
        catatanHTML: ""
      };
      
      // Reset error messages
      this.errorKode = "";
      this.errorJudul = "";
      this.errorHarga = "";
      this.errorQty = "";
      this.errorSafety = "";
    }
  }
});