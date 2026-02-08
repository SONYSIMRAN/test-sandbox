public class InstalledSubscriberPackageModel {
    public SubscriberPackageVersion SubscriberPackageVersion;
    public SubscriberPackage SubscriberPackage;
    public String SubscriberPackageId;
    public String Id;
    // public Attributes attributes;

    public class SubscriberPackageVersion {
        public Integer BuildNumber;
        public Integer PatchVersion;
        public Integer MinorVersion;
        public Integer MajorVersion;
        public String Name;
        public String Id;
        public Boolean IsOrgDependent;
        public String Description;
        public String InstallValidationStatus;
        public Boolean IsBeta;
        public Boolean IsDeprecated;
        public Boolean IsManaged;
        public Boolean IsPasswordProtected;
        public Boolean IsSecurityReviewed;
        public String Package2ContainerOptions;
        public Profiles Profiles;
        // public Attributes attributes;
    }
    public class SubscriberPackage {
        public String Name;
        public String NamespacePrefix;
        // public Attributes attributes;
    }
    public class Profiles {
        public List<SourceProfiles> sourceProfiles;
        public List<DestinationProfiles> destinationProfiles;
    }
    public class SourceProfiles {
        public String value;
        public String label;
    }
    public class DestinationProfiles {
        public String type;
        public String profileId;
        public Boolean noAccess;
        public String name;
        public String displayName;
        public String description;
    }
}