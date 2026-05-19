export function ThemeScript() {
  const scriptContent = `
  (function() {
    try {
      // First, apply dark/light from the toggler key.
      var theme = localStorage.getItem('theme');
      if (theme === 'dark') {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }

      // Then apply the preset token separately.
      var pref = localStorage.getItem('theme-preference');
      if (pref) {
        try {
          var parsed = JSON.parse(pref);
          if (parsed && parsed.theme && parsed.theme !== 'default') {
            document.documentElement.setAttribute('data-theme', parsed.theme);
          } else {
            document.documentElement.removeAttribute('data-theme');
          }
        } catch (e) {
          document.documentElement.removeAttribute('data-theme');
        }
      } else {
        document.documentElement.removeAttribute('data-theme');
      }
    } catch (e) {
      // silent
    }
  })();
  `;

  return (
    <script
      dangerouslySetInnerHTML={{
        __html: scriptContent,
      }}
    />
  );
}

export default ThemeScript;
