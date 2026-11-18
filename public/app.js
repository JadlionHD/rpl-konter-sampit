// Perilaku klien kecil: deteksi operator, toggle kasbon, konfirmasi hapus.
(function () {
  "use strict";

  const PREFIX_OPERATOR = {
    Telkomsel: ["0811", "0812", "0813", "0821", "0822", "0823", "0851", "0852", "0853"],
    Indosat: ["0814", "0815", "0816", "0855", "0856", "0857", "0858"],
    "XL Axiata": ["0817", "0818", "0819", "0859", "0877", "0878"],
    "Tri (3)": ["0895", "0896", "0897", "0898", "0899"],
    Smartfren: ["0881", "0882", "0883", "0884", "0885", "0886", "0887", "0888", "0889"],
  };

  function deteksiOperator(nilai) {
    const bersih = String(nilai || "").replace(/[^0-9]/g, "");
    const prefix = bersih.startsWith("62")
      ? "0" + bersih.slice(2, 5)
      : bersih.slice(0, 4);

    let hasil = "Lainnya";
    for (const operator of Object.keys(PREFIX_OPERATOR)) {
      if (PREFIX_OPERATOR[operator].includes(prefix)) {
        hasil = operator;
        break;
      }
    }
    return bersih.length >= 4 ? hasil : "";
  }

  function aturKasbon(pilihan) {
    const form = pilihan.closest("form");
    if (!form) return;
    const kotak = form.querySelector("[data-kasbon]");
    const nama = form.querySelector("[data-kasbon-nama]");
    const aktif = pilihan.value === "kasbon";
    if (kotak) kotak.hidden = !aktif;
    if (nama) nama.required = aktif;
  }

  document.querySelectorAll("[data-deteksi-operator]").forEach(function (input) {
    const target = document.getElementById(input.dataset.target);
    input.addEventListener("input", function () {
      if (target) target.value = deteksiOperator(input.value);
    });
    if (target && input.value) target.value = deteksiOperator(input.value);
  });

  document.querySelectorAll("[data-kasbon-pemicu]").forEach(function (pilihan) {
    pilihan.addEventListener("change", function () {
      aturKasbon(pilihan);
    });
    aturKasbon(pilihan);
  });

  document.querySelectorAll("form[data-konfirmasi]").forEach(function (form) {
    form.addEventListener("submit", function (event) {
      if (!window.confirm(form.dataset.konfirmasi)) event.preventDefault();
    });
  });
})();
