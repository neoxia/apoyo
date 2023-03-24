import { Exception } from "@apoyo/std";

export class FileNotFoundException extends Exception {
  constructor(message: string) {
    super(message)
  }
}
