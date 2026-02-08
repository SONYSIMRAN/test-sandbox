public class ToolingAPIHelper {

  public class ScoreData {
    @AuraEnabled public Integer score { get; set; }
    @AuraEnabled public String create_time { get; set; }

    public ScoreData(Integer score, String create_time) {
        this.score = score;
        this.create_time = create_time;
    }
  }

  @AuraEnabled(cacheable=true)
  public static List<ScoreData> getScoreDataList() {
      List<ScoreData> scoreList = new List<ScoreData>();

      // Add instances of ScoreData to the list
      scoreList.add(new ScoreData(7833730, '2024-07-04T05:10:09.000Z'));
      scoreList.add(new ScoreData(7836980, '2024-07-05T05:10:07.000Z'));
      scoreList.add(new ScoreData(7841000, '2024-07-06T05:10:08.000Z'));
      scoreList.add(new ScoreData(7846970, '2024-07-11T05:10:07.000Z'));
      scoreList.add(new ScoreData(7861640, '2024-07-12T05:10:08.000Z'));
      scoreList.add(new ScoreData(7865290, '2024-07-13T05:10:08.000Z'));
      scoreList.add(new ScoreData(7865270, '2024-07-14T05:10:07.000Z'));
      scoreList.add(new ScoreData(7865270, '2024-07-15T05:10:06.000Z'));
      scoreList.add(new ScoreData(7875510, '2024-07-16T05:10:08.000Z'));
      scoreList.add(new ScoreData(7886740, '2024-07-17T05:10:11.000Z'));
      scoreList.add(new ScoreData(7886680, '2024-07-18T05:10:07.000Z'));
      scoreList.add(new ScoreData(7926110, '2024-07-19T05:10:07.000Z'));
      scoreList.add(new ScoreData(7951090, '2024-07-20T05:10:07.000Z'));
      scoreList.add(new ScoreData(7966780, '2024-07-21T05:10:07.000Z'));
      scoreList.add(new ScoreData(7967300, '2024-07-22T05:10:07.000Z'));
      scoreList.add(new ScoreData(7967920, '2024-07-23T05:10:09.000Z'));


      return scoreList;
  }
  


// Nodes and Links Data for Metadata Dependency Graph

public class Link {
  @AuraEnabled public String source { get; set; }
  @AuraEnabled public String target { get; set; }

  public Link(String source, String target) {
      this.source = source;
      this.target = target;
  }
}

public class Node {
  @AuraEnabled public String name { get; set; }
  @AuraEnabled public String id { get; set; }
  @AuraEnabled public String type { get; set; }
  @AuraEnabled public String packageName { get; set; }

  public Node(String name, String id, String type, String packageName) {
      this.name = name;
      this.id = id;
      this.type = type;
      this.packageName = packageName;
  }
}

@AuraEnabled(cacheable=true)
public static Map<String, List<Object>> getGraphData() {
  List<Link> links = new List<Link>{
      new Link('LeadCreation', 'Lead.Account__c'),
      new Link('LeadCreation', 'Lead.Do_they_use_staffing_or_services__c'),
      new Link('LeadCreation', 'Lead.Hiring_needs_info__c'),
      new Link('LeadCreation', 'Lead.Reference_Contact__c'),
      new Link('LeadCreation', 'Lead.Urgency__c'),
      new Link('LeadCreation', 'Account.Record_Type_Name__c'),
      new Link('LeadCreation', 'Global_LOV__c.LOV_Name__c'),
      new Link('LeadCreation', 'Global_LOV__c.Text_Value_2__c'),
      new Link('LeadCreation', 'Global_LOV__c.Text_Value_3__c'),
      new Link('LeadCreation', 'Global_LOV__c.Text_Value_4__c'),
      new Link('LeadCreation', 'Global_LOV__c.Text_Value__c'),
      new Link('LeadCreation', 'Lead.Where_did_you_source_the_Lead_from__c'),
      new Link('LeadCreation', 'Lead.LinkedIn_URL__c'),
      new Link('LeadCreation', 'Lead.Primary_Buyer__c'),
      new Link('LeadCreation', 'Lead.Account_Intel__c'),
      new Link('LeadCreation', 'Lead.Account_Manager__c'),
      new Link('LeadCreation', 'Lead.Comments__c'),
      new Link('LeadCreation', 'Lead.Data_Source__c'),
      new Link('LeadCreation', 'Lead.Division__c'),
      new Link('LeadCreation', 'Lead.Operating_Company__c'),
      new Link('LeadCreation', 'Lead.Segment__c'),
      new Link('LeadCreation', 'Lead.What_skillset_hiring__c'),
      new Link('LeadCreation', 'Lead.have_current_hiring_needs__c'),
      new Link('LeadCreation', 'Contact.LinkedIn_URL__c'),
      new Link('LeadCreation', 'Global_LOV__c'),
      new Link('LeadCreation', 'AllegisException'),
      new Link('LeadCreation', 'ConnectedLog'),
      new Link('LeadCreation', 'LeadCountryList'),
      new Link('LeadCreation', 'Error'),
      new Link('LeadCreation', 'LeadAGEmea'),
      new Link('LeadCreation', 'RecordType'),
      new Link('LeadCreation', 'User'),
      new Link('LeadCreation', 'Lead.Division__c'),
      new Link('LeadCreation', 'Lead.Operating_Company__c'),
      new Link('LeadCreation', 'Lead.Division__c')
  };

  List<Node> nodes = new List<Node>{
      new Node('LeadCreation', '01p1E000000v4khQAA', 'ApexClass', 'dx-lead')
  };

  // Create a map to return both links and nodes
  Map<String, List<Object>> graphData = new Map<String, List<Object>>();
  graphData.put('links', (List<Object>)links);
  graphData.put('nodes', (List<Object>)nodes);

  return graphData;
}




}