public class InstalledSubscriverPackageModel {
    public SubscriberPackageVersion SubscriberPackageVersion;
    public SubscriberPackage SubscriberPackage;
    public String SubscriberPackageId;
    public String Id;
    public Attributes attributes;

    public class SubscriberPackageVersion {
        public Integer BuildNumber;
        public Integer PatchVersion;
        public Integer MinorVersion;
        public Integer MajorVersion;
        public String Name;
        public String Id;
        public Attributes attributes;
    }

    public class SubscriberPackage {
        public String Name;
        public String NamespacePrefix;
        public Attributes attributes;
    }

    public class Attributes {
        public String url;
        public String type;
    }
}