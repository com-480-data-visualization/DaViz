document.addEventListener("DOMContentLoaded", () => {
    const dataDiv = document.getElementById("data-content");

    // Placeholder demo - replace with CSV parsing logic later
    dataDiv.innerHTML = `
      <h3>Sample Stats</h3>
      <div class="row">
        <div class="col-md-4">
          <div class="card text-white bg-primary mb-4">
            <div class="card-body">
              <h5 class="card-title">Total Athletes</h5>
              <p class="card-text"><strong>~135,000</strong></p>
            </div>
          </div>
        </div>
        <div class="col-md-4">
          <div class="card text-white bg-secondary mb-4">
            <div class="card-body">
              <h5 class="card-title">Countries Represented</h5>
              <p class="card-text"><strong>206</strong></p>
            </div>
          </div>
        </div>
        <div class="col-md-4">
          <div class="card text-white bg-success mb-4">
            <div class="card-body">
              <h5 class="card-title">Years Covered</h5>
              <p class="card-text"><strong>1896 – 2016</strong></p>
            </div>
          </div>
        </div>
      </div>
    `;
});
