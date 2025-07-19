"use client";
import React, { useRef, useState } from 'react';
import katex from 'katex';
import 'katex/dist/katex.min.css';
import { toPng } from 'html-to-image';

export default function LatexEditor() {
  const [input, setInput] = useState('\\int_0^\\infty e^{-x^2} dx = \\sqrt{\\pi}');
  const [textColor, setTextColor] = useState('#000000');
  const previewRef = useRef(null);

  const handleDownload = async () => {
    if (!previewRef.current) return;

    const dataUrl = await toPng(previewRef.current, {
      cacheBust: true,
      backgroundColor: 'transparent',
    });

    const link = document.createElement('a');
    link.download = 'equation.png';
    link.href = dataUrl;
    link.click();
  };

  const handleCopyToClipboard = async () => {
    if (!previewRef.current) return;

    try {
      const dataUrl = await toPng(previewRef.current, {
        cacheBust: true,
        backgroundColor: 'transparent',
      });

      const blob = await (await fetch(dataUrl)).blob();

      await navigator.clipboard.write([
        new ClipboardItem({ 'image/png': blob }),
      ]);

      alert('Image copied to clipboard!');
    } catch (err) {
      console.error('Failed to copy image:', err);
      alert('Copy failed. Try using Chrome or Edge.');
    }
  };

  const insertTemplate = (latexCode: string) => {
    setInput((prev) => prev + '\n' + latexCode);
  };

  let renderedLatex;
  try {
    renderedLatex = katex.renderToString(input, {
      throwOnError: false,
      displayMode: true,
    });
  } catch (err) {
    renderedLatex = '<span style="color:red;">Invalid LaTeX</span>';
  }

  const templates = {
    Integrals: [
      '\\int_a^b f(x)\\, dx',
      '\\int_0^\\infty e^{-x^2} dx = \\sqrt{\\pi}',
    ],
    Matrices: [
      '\\begin{bmatrix} a & b \\\\ c & d \\end{bmatrix}',
      '\\begin{pmatrix} x & y \\\\ z & w \\end{pmatrix}',
    ],
    Limits: [
      '\\lim_{x \\to \\infty} f(x)',
      '\\lim_{n \\to 0} \\frac{\\sin(n)}{n} = 1',
    ],
    Greek: [
      '\\alpha', '\\beta', '\\gamma', '\\theta', '\\pi', '\\Sigma'
    ],
    Sets: [
      '\\{x \\in \\mathbb{R} \\mid x > 0\\}',
      'A \\cup B',
      'A \\cap B',
      'x \\in A',
    ],
  };

  return (
    <div className='p-4 font-sans'>
    {/* Title */}
      <div className="w-full max-w-md space-y-4 p-6 mx-auto text-center">
        <h1 className="text-2xl font-bold">LaTeX Editor</h1>
        <p className="text-gray-600">
          Write and preview LaTeX equations. Use the sidebar to insert templates.
        </p>
      </div>
      
      {/* Sidebar */}
      <div className="flex max-w-7xl mx-auto p-6 gap-6">
        <div className="w-1/3 border-r pr-4 space-y-4">
          <h2 className="text-lg font-bold">Templates</h2>
          {Object.entries(templates).map(([category, items]) => (
            <div key={category}>
              <h3 className="font-semibold text-sm text-gray-700">{category}</h3>
            <ul className="space-y-1 mt-1">
              {items.map((snippet, i) => {
                let rendered;
                try {
                  rendered = katex.renderToString(snippet, {
                    throwOnError: false,
                    displayMode: false,
                  });
                } catch {
                  rendered = '<span style="color:red;">Invalid</span>';
                }

                return (
                  <li key={i}>
                    <button
                      onClick={() => insertTemplate(snippet)}
                      className="text-center text-sm bg-gray-100 hover:bg-gray-200 w-full px-2 py-1 rounded"
                      dangerouslySetInnerHTML={{ __html: rendered }}
                    />
                  </li>
                );
              })}
            </ul>
            </div>
          ))}
        </div>

        {/* Main Editor */}
        <div className="flex-1 space-y-4">
          <label className="text-sm font-medium text-gray-700">
            Text Color:
          </label>
          <input
            type="color"
            value={textColor}
            onChange={(e) => setTextColor(e.target.value)}
            className="align-sub w-16 h-8 p-1 border-0 cursor-pointer"
          />

          <textarea
            className="w-full border rounded p-2 text-lg"
            rows={4}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              const pairs = {
                '(': ')',
                '{': '}',
                '[': ']',
              };
              const open = e.key;
              const close = pairs[open];
              if (close) {
                e.preventDefault();
                const el = e.target;
                const [start, end] = [el.selectionStart, el.selectionEnd];
                const before = input.slice(0, start);
                const after = input.slice(end);
                const updated = before + open + close + after;
                setInput(updated);

                // Move cursor between brackets after update
                setTimeout(() => {
                  el.selectionStart = el.selectionEnd = start + 1;
                }, 0);
              }
            }}
            placeholder="Write LaTeX here"
          />


          <div
            ref={previewRef}
            className="px-4 py-2 rounded mx-auto "
            style={{ backgroundColor: 'transparent', color: textColor }}
            dangerouslySetInnerHTML={{ __html: renderedLatex }}
          />

          <div className="flex justify-center space-x-4 mt-4">
            <button
              onClick={handleDownload}
              className="bg-blue-500 mx-auto text-white px-4 py-2 rounded hover:bg-blue-600 transition"
            >
              Download PNG
            </button>
            <button
              onClick={handleCopyToClipboard}
              className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 transition"
            >
              Copy to Clipboard
            </button>
          </div>
        </div>
      </div>
      <div>
        <p className="text-xs text-gray-500 text-center mt-4">
          Powered by{' '}
          <a
            href="https://katex.org/"
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-500 hover:underline"
          >
            KaTeX
          </a>
        </p>
        <p className="text-xs text-gray-500 text-center">
          Made with ❤️ by{' Hannah Mou'}
          </p>
      </div>
    </div>
  );
}
