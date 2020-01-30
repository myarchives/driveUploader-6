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

  fileName.hover(
    function() {
      tooltipWrapper.css("visibility", "visible");
    },
    function() {
      tooltipWrapper.css("visibility", "hidden");
    }
  );
  fileSelect.on("change", function() {
    var inputFileName = String.raw`${$(this).val()}`;
    if (inputFileName.lastIndexOf("/") + 1 !== 0) {
      inputFileName = inputFileName.substr(inputFileName.lastIndexOf("/") + 1);
    } else {
      inputFileName = inputFileName.substr(inputFileName.lastIndexOf("\\") + 1);
    }
    fileName.text(inputFileName);
    tooltip.text(inputFileName);
  });

  uploadConfirm.click(event => {
    event.preventDefault();
    var fileData = fileSelect.prop("files")[0];
    var data = new FormData();
    data.append("file", fileData);
    axios.post(`/upload`, data).then(res => {
      status.text(`${res.status + " " + res.statusText}`);
      details.text(JSON.stringify(res.data));
    });
  });
});
