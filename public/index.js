$(() => {
  $(window).scrollTop($(window).height() / 2);
  $(window).scrollLeft($(window).width() / 2);
  const fileName = $("#file-name");
  const tooltipWrapper = $("#tooltip-wrapper");
  const tooltip = $("#tooltip");
  const fileSelect = $("#file-select");
  const uploadConfirm = $("#upload-confirm");
  const status = $("#status");
  const details = $("#details");
  const dropzone = document.getElementsByClassName(
    "slds-file-selector__dropzone"
  )[0];
  const dropFilesDefaultText = "Or drop files here!";

  [
    "drag",
    "dragstart",
    "dragend",
    "dragover",
    "dragenter",
    "dragleave",
    "drop"
  ].forEach(function(event) {
    dropzone.addEventListener(event, function(e) {
      // preventing the unwanted behaviours
      e.preventDefault();
      e.stopPropagation();
    });
  });

  fileName.hover(
    function() {
      tooltipWrapper.css("visibility", "visible");
    },
    function() {
      tooltipWrapper.css("visibility", "hidden");
    }
  );

  fileSelect.on("change", function(e) {
    e.preventDefault();
    var inputFileName = String.raw`${$(this).val()}`;
    if (!inputFileName) {
      inputFileName = dropFilesDefaultText;
    } else {
      if (inputFileName.lastIndexOf("/") + 1 !== 0) {
        inputFileName = inputFileName.substr(
          inputFileName.lastIndexOf("/") + 1
        );
      } else {
        inputFileName = inputFileName.substr(
          inputFileName.lastIndexOf("\\") + 1
        );
      }
    }
    fileName.text(inputFileName);
    tooltip.text(inputFileName);
  });

  dropzone.addEventListener("drop", e => {
    e.preventDefault();
    e.stopPropagation();
    droppedFiles = e.dataTransfer.files[0];
  });

  uploadConfirm.click(event => {
    event.preventDefault();
    var fileData = fileSelect.prop("files")[0];
    var data = new FormData();
    data.append("file", fileData);
    axios
      .post(`https://glacial-plateau-02897.herokuapp.com/upload`, data)
      .then(res => {
        status.text(`${res.status + " " + res.statusText}`);
        details.text(JSON.stringify(res.data));
      });
  });
});
