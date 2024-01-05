select vlocity_cmt__ContractId__c,vlocity_cmt__ContractId__c.Account,vlocity_cmt__QuoteLineItem__c,Id,Name,
SKU__c,vlocity_cmt__OneTimeCharge__c 
from vlocity_cmt__ContractLineItem__c 
where vlocity_cmt__ContractId__c.vlocity_cmt__IsFrameContract__c='1',
vlocity_cmt__ContractId__c.Contract_Type__c='EducationBYOD',
vlocity_cmt__ContractId__c.Deal_Id_List__c<>'',
vlocity_cmt__ContractId__c.Status='Activated,Draft,Expired,Submitted',
vlocity_cmt__ContractId__c.Contract_Verified__c='Y',
vlocity_cmt__ContractId__c.Owner.UserRole like %_HOM_% order by id