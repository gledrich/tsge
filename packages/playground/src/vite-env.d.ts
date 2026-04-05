/// <reference types="vite/client" />

declare module "*.css" {
  const content: { [className: string]: string };
  export default content;
}

interface Window {
  ace: any;
  js_beautify: (text: string, options?: any) => string;
  Dino: any;
}

declare const ace: any;
declare const js_beautify: (text: string, options?: any) => string;

interface PlaygroundEvent extends CustomEvent {
  detail: any;
}
