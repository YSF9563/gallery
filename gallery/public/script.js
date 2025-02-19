document.addEventListener("DOMContentLoaded", function() {
    const filesContainer = document.getElementById('filesContainer');
    const searchBox = document.getElementById('searchBox');
  
    // Load and display files with an optional filter
    function loadFiles(filter = "") {
      fetch('/files')
        .then(res => res.json())
        .then(files => {
          console.log("Files received from server:", files);
          filesContainer.innerHTML = '';
          // Filter based on customName (case-insensitive)
          const filteredFiles = files.filter(file =>
            file.customName.toLowerCase().includes(filter.toLowerCase())
          );
          filteredFiles.forEach(file => {
            const fileDiv = document.createElement('div');
            fileDiv.className = 'file-item';
  
            // Display the custom name above the media
            const nameElem = document.createElement('p');
            nameElem.className = 'file-name';
            nameElem.textContent = file.customName;
            fileDiv.appendChild(nameElem);
  
            // Determine file type based on extension
            const ext = file.filename.split('.').pop().toLowerCase();
            if (['jpg', 'jpeg', 'png', 'gif', 'bmp'].includes(ext)) {
              const img = document.createElement('img');
              img.src = '/uploads/' + file.filename;
              fileDiv.appendChild(img);
            } else if (['mp4', 'webm', 'ogg'].includes(ext)) {
              const video = document.createElement('video');
              video.src = '/uploads/' + file.filename;
              video.controls = true;
              fileDiv.appendChild(video);
            } else {
              // If not recognized as image/video, display the filename
              const p = document.createElement('p');
              p.textContent = file.filename;
              fileDiv.appendChild(p);
            }
  
            // Delete button with password check
            const deleteBtn = document.createElement('button');
            deleteBtn.className = 'delete-btn';
            deleteBtn.textContent = '🗑️';
            deleteBtn.addEventListener('click', function() {
              const password = prompt("Enter password to delete this file:");
              if (password) {
                fetch('/delete', {
                  method: 'POST',
                  headers: {
                    'Content-Type': 'application/json'
                  },
                  body: JSON.stringify({ filename: file.filename, password: password })
                })
                .then(response => {
                  if (response.ok) {
                    loadFiles(searchBox.value); // refresh file list after deletion
                  } else {
                    alert("Failed to delete file: Incorrect password or an error occurred. 😕");
                  }
                });
              }
            });
            fileDiv.appendChild(deleteBtn);
  
            filesContainer.appendChild(fileDiv);
          });
        })
        .catch(err => console.error("Error fetching files:", err));
    }
  
    // Initial load
    loadFiles();
  
    // Filter results as the user types
    searchBox.addEventListener("input", function(e) {
      loadFiles(e.target.value);
    });
  });
  