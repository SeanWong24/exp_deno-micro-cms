export class DBNamespaces {
  static readonly APP = ["app"];
  static readonly APP_GENERAL = DBNamespaces.APP.concat("general");
  static readonly APP_DOCUMENT = DBNamespaces.APP.concat("document");
}
