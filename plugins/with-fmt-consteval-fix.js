const { withPodfile } = require('expo/config-plugins');

const MARKER = 'Fix fmt consteval compilation with newer Apple Clang';
const PATCH = `
    # ${MARKER}
    fmt_base = File.join(installer.sandbox.pod_dir('fmt'), 'include', 'fmt', 'base.h')
    if File.exist?(fmt_base)
      content = File.read(fmt_base)
      patched = content.gsub(/^#\\s*define FMT_USE_CONSTEVAL 1$/, '#  define FMT_USE_CONSTEVAL 0')

      if patched != content
        File.chmod(0644, fmt_base)
        File.write(fmt_base, patched)
      end
    end
`;

function withFmtConstevalFix(config) {
  return withPodfile(config, (mod) => {
    const src = mod.modResults.contents;

    if (src.includes(MARKER)) {
      return mod;
    }

    mod.modResults.contents = src.replace(
      /(react_native_post_install\([\s\S]*?\n\s*\))/,
      `$1\n${PATCH}`
    );

    return mod;
  });
}

module.exports = withFmtConstevalFix;
