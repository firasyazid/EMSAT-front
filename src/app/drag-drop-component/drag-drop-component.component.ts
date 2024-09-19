import { Component, OnInit } from '@angular/core';
 import { CdkDragDrop, transferArrayItem } from '@angular/cdk/drag-drop';

@Component({
  selector: 'app-drag-drop-component',
  templateUrl: './drag-drop-component.component.html',
  styleUrls: ['./drag-drop-component.component.css']
})
export class DragDropComponentComponent   {
  question = {
    type: 'dragAndDrop',
    text: 'Drag the items to the correct placeholders',
    dragAndDropData: {
      draggableItems: ['Firas', 'firas', 'firas'] // Static items to be dragged
    }
  };

  // Static placeholders data
  placeholder1Data: string[] = [];
  placeholder2Data: string[] = [];
  placeholder3Data: string[] = [];

  
  drop(event: CdkDragDrop<string[]>) {
    if (event.previousContainer === event.container) {
      // This can handle cases where you want to reorder items within the same container
      const container = event.container.data as string[];
      const previousIndex = event.previousIndex;
      const currentIndex = event.currentIndex;
      const movedItem = container[previousIndex];
      container.splice(previousIndex, 1);
      container.splice(currentIndex, 0, movedItem);
    } else {
      // Handle moving items between different containers
      transferArrayItem(
        event.previousContainer.data,
        event.container.data,
        event.previousIndex,
        event.currentIndex
      );
    }
  }
  
}
