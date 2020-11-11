package it.cnr.si.flows.ng.listeners.cnr.missioniOrdine;




import org.activiti.engine.RuntimeService;
import org.activiti.engine.TaskService;
import org.activiti.engine.delegate.DelegateExecution;
import org.activiti.engine.delegate.ExecutionListener;
import org.activiti.engine.delegate.Expression;
import org.activiti.engine.impl.TaskServiceImpl;
import org.activiti.engine.runtime.ProcessInstance;
import org.activiti.engine.task.Task;
import org.activiti.rest.common.api.DataResponse;
import org.activiti.rest.service.api.history.HistoricProcessInstanceResponse;
import org.apache.commons.io.FileUtils;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Profile;
import org.springframework.stereotype.Component;

import com.google.common.net.MediaType;

import it.cnr.si.flows.ng.service.FirmaDocumentoService;
import it.cnr.si.flows.ng.service.FlowsAttachmentService;
import it.cnr.si.flows.ng.service.FlowsCsvService;
import it.cnr.si.flows.ng.service.FlowsProcessInstanceService;
import it.cnr.si.flows.ng.service.FlowsTaskService;
import it.cnr.si.flows.ng.service.ProtocolloDocumentoService;
import it.cnr.si.flows.ng.utils.Enum;
import it.cnr.si.flows.ng.utils.Enum.StatoDomandeSTMEnum;
import it.cnr.si.service.AceService;
import it.cnr.si.service.ExternalMessageService;
import it.cnr.si.service.dto.anagrafica.scritture.BossDto;
import it.cnr.si.domain.enumeration.ExternalApplication;
import it.cnr.si.domain.enumeration.ExternalMessageVerb;
import it.cnr.si.flows.ng.dto.FlowsAttachment;
import it.cnr.si.flows.ng.exception.TaskFailedException;
import it.cnr.si.flows.ng.listeners.cnr.acquisti.service.AcquistiService;

import static it.cnr.si.flows.ng.utils.Utils.PROCESS_VISUALIZER;
import static it.cnr.si.flows.ng.utils.Enum.Azione.GenerazioneDaSistema;
import static it.cnr.si.flows.ng.utils.Enum.VariableEnum.statoFinaleDomanda;

import java.io.File;
import java.io.IOException;
import java.io.PrintWriter;
import java.nio.file.Files;
import java.nio.file.attribute.FileAttribute;
import java.nio.file.attribute.FileAttributeView;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import javax.inject.Inject;
import javax.servlet.http.HttpServletResponse;

@Component
@Profile("cnr")
public class ManageProcessMissioniOrdine_v1 implements ExecutionListener {
	private static final long serialVersionUID = 686169707042367215L;
	private static final Logger LOGGER = LoggerFactory.getLogger(ManageProcessMissioniOrdine_v1.class);
	public static final String STATO_FINALE_GRADUATORIA = "statoFinaleDomanda";


	@Value("${cnr.missioni.url}")
	private String urlMissioni;
	@Value("${cnr.missioni.domandePath}")
	private String pathDomandeMissioni;

	@Inject
	private FirmaDocumentoService firmaDocumentoService;
	@Inject
	private FlowsProcessInstanceService flowsProcessInstanceService;
	@Inject
	private StartMissioniOrdineSetGroupsAndVisibility startMissioniOrdineSetGroupsAndVisibility;
	@Inject
	private ExternalMessageService externalMessageService;	
	@Inject
	private AceService aceService;

	private Expression faseEsecuzione;

	public void restToApplicazioneMissioni(DelegateExecution execution, StatoDomandeSTMEnum statoDomanda) {

		// @Value("${cnr.accordi-bilaterali.url}")
		// private String urlShortTermMobility;
		// @Value("${cnr.accordi-bilaterali.usr}")
		// private String usrAccordiBilaterali;	
		// @Value("${cnr.accordi-bilaterali.psw}")
		// private String pswAccordiBilaterali;
		//Double idDomanda = Double.parseDouble(execution.getVariable("idDomanda").toString());
		String idDomanda = execution.getVariable("idDomanda").toString();
		Map<String, Object> stmPayload = new HashMap<String, Object>()
		{
			{
				put("idDomanda", idDomanda);
				put("stato", statoDomanda.name().toString());
			}	
		};

		String url = urlMissioni + pathDomandeMissioni;
		externalMessageService.createExternalMessage(url, ExternalMessageVerb.POST, stmPayload, ExternalApplication.MISSIONI);
	}


	@Override
	public void notify(DelegateExecution execution) throws Exception {
		//(OivPdfService oivPdfService = new OivPdfService();

		Map<String, FlowsAttachment> attachmentList;
		String processInstanceId =  execution.getProcessInstanceId();
		String executionId =  execution.getId();
		String stato =  execution.getCurrentActivityName();
		String sceltaUtente = "start";
		if(execution.getVariable("sceltaUtente") != null) {
			sceltaUtente =  (String) execution.getVariable("sceltaUtente");	
		}

		LOGGER.info("ProcessInstanceId: " + processInstanceId);
		String faseEsecuzioneValue = "noValue";
		faseEsecuzioneValue = faseEsecuzione.getValue(execution).toString();
		LOGGER.info("-- azioneScelta: " + faseEsecuzioneValue + " con sceltaUtente: " + sceltaUtente);

		switch(faseEsecuzioneValue){  
		// START
		case "process-start": {
			startMissioniOrdineSetGroupsAndVisibility.configuraVariabiliStart(execution);
			execution.setVariable("tutteDomandeAccettateFlag", "false");
		};break;    

		// START
		case "respinto-uo-start": {
			restToApplicazioneMissioni(execution, Enum.StatoDomandeSTMEnum.RESPINTO_UO);
		};break;


		case "respinto-spesa-start": {
			restToApplicazioneMissioni(execution, Enum.StatoDomandeSTMEnum.RESPINTO_UO_SPESA);
		};break;


		case "firma-uo-end": {
			if(sceltaUtente != null && sceltaUtente.equals("Firma")) {
				firmaDocumentoService.eseguiFirma(execution, "missioni-ordine", null);
			}
			//SE I DUE FIRMATARI SPESA E UO SONO LA STESSA PERSONA
			if (execution.getVariable("validazioneSpesaFlag").toString().equalsIgnoreCase("si")) {
				String gruppoFirmatarioUo = execution.getVariable("gruppoFirmatarioUo").toString();
				String gruppoFirmatarioSpesa = execution.getVariable("gruppoFirmatarioSpesa").toString();
				List<BossDto> utentiGruppoFirmatarioUo = aceService.getUtentiInRuoloCnr(gruppoFirmatarioUo);
				List<BossDto> utentiGruppoFirmatarioSpesa = aceService.getUtentiInRuoloCnr(gruppoFirmatarioSpesa);
				if (!utentiGruppoFirmatarioUo.equals(utentiGruppoFirmatarioSpesa)) {
					execution.setVariable("firmaSpesaFlag", "si");
				}
			}
			};break; 
		case "firma-spesa-end": {
			if(sceltaUtente != null && sceltaUtente.equals("Firma")) {
				firmaDocumentoService.eseguiFirma(execution, "missioni-ordine", null);
			}
		};break; 

		case "endevent-respintoUo-start": {
			execution.setVariable("STATO_FINALE_DOMANDA", "RESPINTO UO");
			flowsProcessInstanceService.updateSearchTerms(executionId, processInstanceId, "RESPINTO UO");
		};break;    	

		case "endevent-respintoUoSpesa-start": {
			execution.setVariable("STATO_FINALE_DOMANDA", "RESPINTO UO SPESA");
			flowsProcessInstanceService.updateSearchTerms(executionId, processInstanceId, "RESPINTO UO SPESA");
		};break;    	

		case "endevent-firmato-start": {
			execution.setVariable("STATO_FINALE_DOMANDA", "FIRMATO");
			flowsProcessInstanceService.updateSearchTerms(executionId, processInstanceId, "FIRMATO");
		};break;  

		case "process-end": {
			//sbloccaDomandeBando(execution);
		};break; 
		// DEFAULT  
		default:  {
		};break;    

		} 
		}


	}
