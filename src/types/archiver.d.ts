declare module 'archiver' {
  import { Writable } from 'stream';

  type ArchiverInstance = {
    pipe(destination: Writable): Writable;
    append(source: string | Buffer, data: { name: string }): void;
    file(filePath: string, data: { name: string }): void;
    finalize(): Promise<void>;
  };

  type ArchiverFactory = (format: 'zip', options?: { zlib?: { level?: number } }) => ArchiverInstance;

  const archiver: ArchiverFactory;

  export default archiver;
}