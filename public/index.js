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
  const dropzone = $("#dropzone");
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
    dropzone.on(event, function(e) {
      // preventing unwanted behaviours
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
    reflectNameChange(inputFileName);
  });

  dropzone.on("drop", e => {
    var files = e.target.files;
    if (!files || files.length === 0)
      files = e.dataTransfer
        ? e.dataTransfer.files
        : e.originalEvent.dataTransfer.files;
    reflectNameChange(files[0].name);
    fileSelect.prop("files", files);
  });

  uploadConfirm.click(event => {
    event.preventDefault();
    uploadFile(fileSelect.prop("files")[0]);
  });

  const reflectNameChange = async inputFileName => {
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
  };

  const uploadFile = fileData => {
    var data = new FormData();
    data.append("file", fileData);
    axios
      .post(`https://glacial-plateau-02897.herokuapp.com/upload`, data)
      .then(res => {
        status.text(`${res.status + " " + res.statusText}`);
        details.text(JSON.stringify(res.data));
      });
  };
});
