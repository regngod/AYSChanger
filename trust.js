'use strict';
(() => {
  const expected = 'f7a174a2544a67bff4aa24c6c5f991465c0b3621c77db20c7cfee2de86aece37';
  const input = document.getElementById('verify-file');
  const result = document.getElementById('verify-result');
  let request = 0;
  if (input && result) input.addEventListener('change', async () => {
    const selected = ++request;
    const file = input.files && input.files[0];
    if (!file) return;
    const show = (text, state) => {
      if (selected !== request) return;
      result.textContent = text;
      result.dataset.state = state;
    };
    if (!globalThis.crypto || !globalThis.crypto.subtle) {
      show('В этом браузере локальное вычисление SHA256 недоступно. Используйте команду PowerShell ниже.', 'error');
      return;
    }
    if (file.size > 128 * 1024 * 1024) {
      show('Этот файл больше 128 МиБ и не соответствует размеру текущей сборки. Выберите скачанный AYSChanger.exe.', 'mismatch');
      return;
    }
    show('Вычисляем SHA256 файла «' + file.name + '» на вашем компьютере…', 'pending');
    try {
      const digest = await crypto.subtle.digest('SHA-256', await file.arrayBuffer());
      const actual = Array.from(new Uint8Array(digest), byte => byte.toString(16).padStart(2, '0')).join('');
      if (actual === expected) show('Хеш совпадает с версией 1.0.126.1 на этой странице. Это подтверждает совпадение файла, но не его безопасность.', 'match');
      else show('Хеш не совпадает с версией 1.0.126.1 на этой странице. Возможно, выбрана другая версия или другой файл.\nSHA256 выбранного файла: ' + actual, 'mismatch');
    } catch (_) {
      show('Не удалось прочитать файл или вычислить хеш. Попробуйте снова либо используйте PowerShell ниже.', 'error');
    }
  });
  document.querySelectorAll('[data-copy-hash]').forEach(button => {
    button.addEventListener('click', async () => {
      const message = document.getElementById('copy-result');
      try {
        await navigator.clipboard.writeText(button.dataset.copyHash);
        if (message) message.textContent = 'SHA256 скопирован.';
        button.textContent = 'Скопировано';
        setTimeout(() => { button.textContent = 'Скопировать хеш'; }, 2200);
      } catch (_) {
        const value = document.getElementById('release-sha');
        const selection = window.getSelection();
        if (value && selection) {
          const range = document.createRange(); range.selectNodeContents(value);
          selection.removeAllRanges(); selection.addRange(range);
        }
        if (message) message.textContent = 'Автоматическое копирование недоступно. Хеш выделен — скопируйте его вручную.';
      }
    });
  });
})();
