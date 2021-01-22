// Code taken from https://github.com/Simonwep/li18nt/blob/master/src/cli/utils/log.ts
/* eslint-disable no-console */
import chalk, {Chalk} from 'chalk';

const {stdout} = process;

export const logger = new class {
    public warnings = 0;
    public errors = 0;

    public blankLn(str = ''): void {
        this.blank(`${str}\n`);
    }

    public warnLn(str: string): void {
        this.warn(`${str}\n`);
    }

    public errorLn(str: string): void {
        this.error(`${str}\n`);
    }

    public successLn(str: string): void {
        this.success(`${str}\n`);
    }

    public infoLn(str: string): void {
        this.info(`${str}\n`);
    }

    public debugLn(str: string): void {
        this.debug(`${str}\n`);
    }

    public blank(str: string): void {
        stdout.write(str);
    }

    public warn(str: string): void {
        stdout.write(`${chalk.yellowBright('[!]')} ${str}`);
        this.warnings++;
    }

    public error(str: string): void {
        stdout.write(`${chalk.redBright('[X]')} ${str}`);
        this.errors++;
    }

    public success(str: string): void {
        stdout.write(`${chalk.greenBright('[✓]')} ${str}`);
    }

    public info(str: string): void {
        stdout.write(`${chalk.blueBright('[i]')} ${str}`);
    }

    public debug(str: string): void {
        stdout.write(`[-] ${str}`);
    }

    public printSummary(): void {
        const format = (v: number, name: string, fail: Chalk, ok: Chalk): string => {
            const color = v ? fail : ok;
            return v === 0 ? `${color('zero')} ${name}s` :
                v === 1 ? `${color('one')} ${name}` : `${color(v)} ${name}s`;
        };

        const warnings = format(this.warnings, 'warning', chalk.yellowBright, chalk.greenBright);
        const errors = format(this.errors, 'error', chalk.redBright, chalk.greenBright);
        const info = `Finished with ${warnings} and ${errors}.`;
        this[this.errors ? 'errorLn' : this.warnings ? 'warnLn' : 'successLn'](info);
    }
};

