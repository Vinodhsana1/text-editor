import React, { useEffect, useState } from 'react';
import fontsDataJson from '../assets/fonts.json';
import './App.css';

interface FontVariants {
  [variant: string]: string;
}

interface FontsData {
  [fontFamily: string]: FontVariants;
}

const fontsData: FontsData = fontsDataJson as FontsData;

const TextEditor: React.FC = () => {
  const [text, setText] = useState('');
  const [fontFamily, setFontFamily] = useState('');
  const [fontVariant, setFontVariant] = useState('');
  const [isItalic, setIsItalic] = useState(false);

  useEffect(() => {
    const savedText = localStorage.getItem('textEditorContent');
    const savedFontFamily = localStorage.getItem('fontFamily');
    const savedFontVariant = localStorage.getItem('fontVariant');
    const savedItalic = localStorage.getItem('italicToggle') === 'true';

    if (savedText) setText(savedText);
    if (savedFontFamily) setFontFamily(savedFontFamily);
    if (savedFontVariant) setFontVariant(savedFontVariant);
    setIsItalic(savedItalic);

    if (savedFontFamily && fontsData[savedFontFamily]) {
      updateFontVariantSelect(savedFontFamily);
    }
  }, []);

  useEffect(() => {
    updateEditorFont();
  }, [fontFamily, fontVariant, isItalic]);

  const updateFontVariantSelect = (selectedFont: string) => {
    if (!selectedFont || !fontsData[selectedFont]) return;

    const variants = fontsData[selectedFont];
    const variantSelect = document.getElementById('fontVariant') as HTMLSelectElement;
    variantSelect.innerHTML = '';

    Object.keys(variants).forEach((variant) => {
      const option = document.createElement('option');
      option.value = variant;
      option.textContent = variant;
      variantSelect.appendChild(option);
    });

    const closestVariant = findClosestVariant(Object.keys(variants), fontVariant, isItalic);
    setFontVariant(closestVariant);
  };

  const findClosestVariant = (variants: string[], currentVariant: string, italic: boolean): string => {
    if (italic) {
      const closestItalic = variants.find((v) => v.includes('italic'));
      if (closestItalic) return closestItalic;
    }

    const currentWeight = parseInt(currentVariant.replace('italic', ''), 10);
    let closestWeight = variants[0];

    for (const variant of variants) {
      const variantWeight = parseInt(variant.replace('italic', ''), 10);
      if (
        Math.abs(variantWeight - currentWeight) <
        Math.abs(parseInt(closestWeight.replace('italic', ''), 10) - currentWeight)
      ) {
        closestWeight = variant;
      }
    }

    return closestWeight;
  };

  const updateEditorFont = () => {
    if (!fontFamily || !fontVariant || !fontsData[fontFamily]) return;

    const fontWeight = fontVariant.replace('italic', '');
    const fontStyle = fontVariant.includes('italic') ? 'italic' : 'normal';

    const textEditor = document.getElementById('textEditor') as HTMLTextAreaElement;
    textEditor.style.fontFamily = fontFamily;
    textEditor.style.fontWeight = fontWeight;
    textEditor.style.fontStyle = fontStyle;

    loadGoogleFont(fontFamily, fontVariant);
  };

  const removeGoogleFonts = () => {
    const links = document.querySelectorAll('link[rel="stylesheet"]');
    links.forEach(link => {
      const linkElement = link as HTMLLinkElement;
      if (linkElement.href.includes('fonts.googleapis.com')) {
        linkElement.remove();
      }
    });
  };

  const loadGoogleFont = (fontFamily: string, variant: string) => {
    removeGoogleFonts();

    const fontData = fontsData[fontFamily];
    if (!fontData || !fontData[variant]) {
      console.error(`Font data not found for ${fontFamily} and variant ${variant}`);
      return;
    }

    const link = document.createElement('link');
    link.href = fontData[variant];
    link.rel = 'stylesheet';
    document.head.appendChild(link);
  };

  const handleSave = () => {
    localStorage.setItem('textEditorContent', text);
    localStorage.setItem('fontFamily', fontFamily);
    localStorage.setItem('fontVariant', fontVariant);
    localStorage.setItem('italicToggle', isItalic.toString());
  };

  const handleReset = () => {
    setText('');
    setFontFamily('');
    setFontVariant('');
    setIsItalic(false);
    updateEditorFont();
  };

  // Determine if italic is available for the selected font family
  const hasItalicVariant = fontFamily && fontsData[fontFamily] && 
    Object.keys(fontsData[fontFamily]).some((variant) => variant.includes('italic'));

  return (
    <div className="container">
      <h1 className="heading">Text Editor</h1>
      <div className="controls">
        <label htmlFor="fontFamily">Font Family</label>
        <select
          id="fontFamily"
          value={fontFamily}
          onChange={(e) => {
            const selectedFont = e.target.value;
            setFontFamily(selectedFont);
            if (selectedFont in fontsData) {
              updateFontVariantSelect(selectedFont);
            }
          }}
        >
          <option value="">Select Font</option>
          {Object.keys(fontsData).map((font) => (
            <option key={font} value={font}>
              {font}
            </option>
          ))}
        </select>

        <label htmlFor="fontVariant">Variant</label>
        <select
          id="fontVariant"
          value={fontVariant}
          onChange={(e) => setFontVariant(e.target.value)}
        >
          <option value="">Select Variant</option>
          {fontFamily &&
            fontsData[fontFamily] &&
            Object.keys(fontsData[fontFamily]).map((variant) => (
              <option key={variant} value={variant}>
                {variant}
              </option>
            ))}
        </select>

        <fieldset>
          <legend>Text Style</legend>
          <label htmlFor="italicToggle">
            <input
              type="radio"
              id="italicToggle"
              name="textStyle"
              checked={isItalic}
              onChange={() => setIsItalic(!isItalic)}
              disabled={!hasItalicVariant}
            />
            Italic
          </label>
        </fieldset>

        <button id="resetBtn" onClick={handleReset}>
          Reset
        </button>
        <button id="saveBtn" onClick={handleSave}>
          Save
        </button>
      </div>
      <textarea
        id="textEditor"
        rows={10}
        cols={50}
        value={text}
        onChange={(e) => setText(e.target.value)}
      ></textarea>
    </div>
  );
};

export default TextEditor;
