interface Import {
    src: string;
    imports?: string[];
    default?: string;
}

export const generateImport = (opt: Import): string => {
    const imports = [opt.default, opt.imports?.length ? `{${opt.imports.join(', ')}}` : ''];
    return `import ${imports.filter(Boolean).join(', ')} from '${opt.src}';`;
};

