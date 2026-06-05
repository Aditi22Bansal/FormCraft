(function () {
  const script = document.currentScript;
  const formId = script.getAttribute('data-form-id');
  const baseUrl = script.src.replace('/widget.js', '');
  if (!formId) return;

  const btn = document.createElement('button');
  btn.innerHTML = '📋';
  btn.style.cssText = 'position:fixed;bottom:24px;right:24px;width:52px;height:52px;border-radius:50%;background:#7C6FCD;color:#fff;border:none;font-size:22px;cursor:pointer;z-index:99999;box-shadow:0 4px 12px rgba(0,0,0,0.3)';
  document.body.appendChild(btn);

  let iframe = null;
  btn.addEventListener('click', () => {
    if (iframe) { iframe.remove(); iframe = null; return; }
    iframe = document.createElement('iframe');
    iframe.src = `${baseUrl}/f/${formId}?embed=1&referrer=${encodeURIComponent(document.referrer)}&source=${encodeURIComponent(location.href)}`;
    iframe.style.cssText = 'position:fixed;bottom:90px;right:24px;width:400px;height:560px;border:1px solid #2A2A38;border-radius:12px;z-index:99999;background:#0F0F13';
    document.body.appendChild(iframe);
  });
})();
