import java.util.Scanner; // import dari keyboard

public class GajiKaryawan { // class utama
    public static void main(String[] args) { // metode main
        Scanner scanner = new Scanner(System.in); // membuat objek scanner untuk membaca inputan dari pengguna
        System.out.print("Masukkan Golongan (A/B/C): "); 
        char golongan = scanner.next().charAt(0); // membaca input golongan dan mengambil karakter pertama

        System.out.print("Masukkan Jam Lembur: ");
        int jamLembur = scanner.nextInt(); // membaca input jam lembur

        double gajiPokok = 0; //variable untuk menyimpan gaji pokok, diset kembali ke 0
        double gajiLembur = 0; //variable untuk menyimpan gaji lembur, diset kembali ke 0

        // menentukan gaji pokok berdasarkan golongan
        if (golongan == 'A' || golongan == 'a'){
            gajiPokok = 5000000;
        } else if (golongan == 'B' || golongan == 'b') {
            gajiPokok = 6500000;
        } else if (golongan == 'C' || golongan == 'c') {
            gajiPokok = 9500000;
        } else {
            System.out.println("Golongan tidak valid.");
            scanner.close();
            return; // keluar dari program jika golongan tidak valid
        }
        // Menentukan gaji Lembur berdasarkan jam lembur
        if (jamLembur == 1){
            gajiLembur = 0.30 * gajiPokok; // Jika lembur 1 jam, gaji lembur 30% dari gaji pokok
        } else if (jamLembur == 2){
            gajiLembur = 0.32 * gajiPokok; // Jika lembur 2 jam, gaji lembur 32% dari gaji pokok
        } else if (jamLembur == 3){
            gajiLembur = 0.34 * gajiPokok; // Jika lembur 3 jam, gaji lembur 34% dari gaji pokok
        } else if (jamLembur == 4){
            gajiLembur = 0.36 * gajiPokok; // Jika lembur 4 jam, gaji lembur 36% dari gaji pokok
        } else if (jamLembur >= 5){
            gajiLembur = 0.38 * gajiPokok; // Jika lembur 5 jam atau lebih, gaji lembur 38% dari gaji pokok
        }
    
        double totalGaji = gajiPokok + gajiLembur; // menghitung total gaji
        System.out.println("Jumlah Penghasilan Anda: Rp " + totalGaji);
        
        scanner.close(); // menutup scanner
    }
}
