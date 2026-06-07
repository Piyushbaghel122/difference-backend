declare module "passport-github2" {
  import {
    Profile as PassportProfile,
    Strategy as PassportStrategy
  } from "passport";

  export interface Profile extends PassportProfile {
    profileUrl?: string;
  }

  export class Strategy extends PassportStrategy {
    constructor(options: object, verify: (...args: any[]) => void);
  }
}
