/**
 * Runs before paint to apply the saved (or system) theme, preventing a
 * flash of the wrong theme. Defaults to dark when nothing is stored.
 */
export function ThemeScript() {
  const code = `(function(){try{var t=localStorage.getItem('theme');var dark=t?t==='dark':window.matchMedia('(prefers-color-scheme: dark)').matches;var c=document.documentElement.classList;if(dark){c.add('dark');}else{c.remove('dark');}document.documentElement.style.colorScheme=dark?'dark':'light';}catch(e){document.documentElement.classList.add('dark');}})();`
  return <script dangerouslySetInnerHTML={{ __html: code }} />
}
