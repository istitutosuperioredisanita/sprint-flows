package it.cnr.si.flows.ng.resource;

import com.codahale.metrics.annotation.Timed;
import it.cnr.si.security.AuthoritiesConstants;
import it.cnr.si.spring.storage.StorageObject;
import it.cnr.si.spring.storage.StoreService;
import org.apache.commons.io.IOUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.annotation.Secured;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseBody;

import java.io.IOException;
import java.io.InputStream;
import java.util.List;
import java.util.stream.Collectors;

@Controller
@RequestMapping("api/manual")
public class FlowsManualResource {

    private static final String DIR_MANUALI = "/Comunicazioni al CNR/flows/Manuali/";
    private static final String TITLE = "cm:title";
    @Autowired(required = false)
    private StoreService storeService;

    @RequestMapping(value = "", method = RequestMethod.GET, produces = MediaType.APPLICATION_JSON_VALUE)
    @ResponseBody
    @Secured(AuthoritiesConstants.USER)
    @Timed
    public ResponseEntity<List<String>> getElencoManuali() {
        StorageObject dirObject = storeService.getStorageObjectByPath(DIR_MANUALI, true);
        List<StorageObject> manuali = storeService.getChildren(dirObject.getKey());

        List<String> paths = manuali.stream()
                .map(m -> (String) m.getPropertyValue(TITLE) )
                .collect(Collectors.toList());

        return ResponseEntity.ok(paths);
    }

    @RequestMapping(value = "", method = RequestMethod.GET, produces = MediaType.APPLICATION_OCTET_STREAM_VALUE)
    @ResponseBody
    @Secured(AuthoritiesConstants.USER)
    @Timed
    public ResponseEntity<byte[]> getManuale(
            @RequestParam("manuale") String manuale) throws IOException {
        StorageObject manObject = storeService.getStorageObjectByPath(DIR_MANUALI + manuale, false);

        InputStream stream = storeService.getResource(manObject.getKey());

        return ResponseEntity.ok(IOUtils.toByteArray(stream) );
    }
}
