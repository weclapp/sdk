/* eslint-disable no-console */
import {pluralize} from '@utils/pluralize';
import chalk, {ChalkInstance} from 'chalk';

export const logger = new class {
    public active = true;
    public warnings = 0;
    public errors = 0;

    public write(str = ''): void {
        process.stdout.write(str);
    }

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
        this.write(str);
    }

    public warn(str: string): void {
        this.write(`${chalk.yellowBright('[!]')} ${str}`);
        this.warnings++;
    }

    public error(str: string): void {
        this.write(`${chalk.redBright('[X]')} ${str}`);
        this.errors++;
    }

    public success(str: string): void {
        this.write(`${chalk.greenBright('[✓]')} ${str}`);
    }

    public info(str: string): void {
        this.write(`${chalk.blueBright('[i]')} ${str}`);
    }

    public debug(str: string): void {
        this.write(`[-] ${str}`);
    }

    public printSummary(): void {
        const format = (v: number, name: string, fail: ChalkInstance, ok: ChalkInstance): string => {
            const color = v ? fail : ok;
            return v === 0 ? `${color('zero')} ${pluralize(name)}` :
                v === 1 ? `${color('one')} ${name}` : `${color(v)} ${pluralize(name)}`;
        };

        const warnings = format(this.warnings, 'warning', chalk.yellowBright, chalk.greenBright);
        const errors = format(this.errors, 'error', chalk.redBright, chalk.greenBright);
        const info = `Finished with ${warnings} and ${errors}.`;
        this[this.errors ? 'errorLn' : this.warnings ? 'warnLn' : 'successLn'](info);
    }
};

