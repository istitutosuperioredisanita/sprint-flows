package it.cnr.si.flows.ng.listeners.iss.multiTaskAssignement;


import static it.cnr.si.flows.ng.utils.Enum.VariableEnum.initiator;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import javax.inject.Inject;

import org.activiti.engine.RepositoryService;
import org.activiti.engine.delegate.DelegateExecution;
import org.activiti.engine.delegate.ExecutionListener;
import org.activiti.engine.delegate.Expression;
import org.activiti.engine.repository.ProcessDefinition;
import org.activiti.engine.runtime.ProcessInstance;
import org.json.JSONArray;
import org.json.JSONException;
import org.json.JSONObject;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.context.annotation.Profile;
import org.springframework.stereotype.Component;

import it.cnr.si.flows.ng.service.FlowsTaskService;
import it.cnr.si.flows.ng.utils.Enum;
import it.cnr.si.flows.ng.utils.SecurityUtils;
import it.cnr.si.flows.ng.utils.Utils;
import it.cnr.si.service.DraftService;

@Component
@Profile("iss")
public class ManageProcessParallel_v1 implements ExecutionListener {
	@Inject
	private FlowsTaskService flowsTaskService;
    @Inject
    private RepositoryService repositoryService;
    
	private static final long serialVersionUID = 686169707042367215L;
	private static final Logger LOGGER = LoggerFactory.getLogger(ManageProcessParallel_v1.class);
	private Expression faseEsecuzione;

    
	@Override
	public void notify(DelegateExecution execution) throws Exception {
		
		String currentUser = SecurityUtils.getCurrentUserLogin();
		String processInstanceId =  execution.getProcessInstanceId();
		String executionId =  execution.getId();
		String stato =  execution.getCurrentActivityName();
		
		String faseEsecuzioneValue = faseEsecuzione.getValue(execution).toString();
		
		LOGGER.info("ProcessInstanceId: "+processInstanceId+" Current User: "+currentUser+" executionId: "+executionId+" stato: "+stato+" fase esecuzione: "+faseEsecuzioneValue);
		
		switch(faseEsecuzioneValue){  
			// prepare list at the end of the previously task
			case "process-prepareVariableNextTask": {
				LOGGER.info("process-prepareVariableNextTask phase started at the END of the task");
				
				//convert json assignee list in Arraylist for assing task for every element of the list		
				String assigneeListJson = (String)execution.getVariable("assigneeList_json");
				List<String> assigneeList = assembleAssigneeList(assigneeListJson);
		        execution.setVariable("assigneeList", assigneeList);
				
				LOGGER.info("proposeListCandidate: "+ execution.getVariable("assigneeList"));

			}
			break;
			case "process-endPhase1":{
				LOGGER.info("process-endPhase1: inject phase1_b");
				ProcessDefinition pd = repositoryService.createProcessDefinitionQuery()
	                    .processDefinitionKey("MACCISS-autorizzaProposte")
	                    .latestVersion()
	                    .singleResult();
				Map<String, Object> vars = execution.getVariables();
				String titolo = (String) vars.get(Enum.VariableEnum.titolo.name());
				vars.put(Enum.VariableEnum.titolo.name(),titolo+" - FASE2 autorizza proposte -");
				vars.put(Enum.VariableEnum.initiator.name(), "app.scrivaniadigitale");
				vars.put(initiator.name(), "app.scrivaniadigitale");

	            vars.put("processDefinitionId", pd.getId());
	            vars.put("startDateMACCISS", vars.get("startDate"));
	            vars.put("titoloOrigine",titolo);
	            DateTimeFormatter dtf = DateTimeFormatter.ofPattern("dd/MM/yyyy HH:mm:ss");  
	            LocalDateTime now = LocalDateTime.now();  
	            vars.put("dueDateFase1",dtf.format(now));
	            flowsTaskService.startProcessInstanceAsApplication(pd.getId(), vars,"app.scrivaniadigitale");
	            LOGGER.info("MACCISS-autorizzaProposte - STARTED -");
	            
	            execution.setVariable("statoFinale", "MACCISS: fase1 raccolta proposte COMPLETATA");	                       
			}
			break;
			case "process-endPhase1_b":{
				LOGGER.info("process-endPhase1_b: inject phase2");
				// TO DO
	            execution.setVariable("statoFinale", "MACCISS: fase1_b autorizzazione proposte COMPLETATA");
			}	
			default: 
				LOGGER.info("fase esecuzione non gestita: "+faseEsecuzioneValue);				
			break;
		} 
	}

	private List<String> assembleAssigneeList(String jsonList){
		List<String> assigneeList= new ArrayList<String>();
		if(jsonList != null) {
			JSONArray assignees = new JSONArray(jsonList);
			for ( int i = 0; i < assignees.length(); i++) {
				JSONObject assigne = assignees.getJSONObject(i);
				try {
					assigneeList.add( assigne.getString("assegna"));			            	
				} catch (JSONException e) {
					LOGGER.error("Formato Non Valido");			               
				}
			}
		}
		return assigneeList;
	}
}
