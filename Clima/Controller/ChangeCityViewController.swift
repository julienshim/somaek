//
//  ChangeCityViewController.swift
//  Clima
//
//  Created by Julien Shim on 4/16/19.
//  Copyright © 2019 Julien Shim. All rights reserved.
//

import UIKit

class ChangeCityViewController: UIViewController {
    
    // Declare the delagate variables here:
    
    //This is the IBOutlets to the text field:
    @IBOutlet weak var changeCityTextField: UITextField!
    
    //This is the IBAction that gets called when the user taps on the "Get Weather" button:
    @IBAction func getWeatherPressed(_ sender: AnyObject) {
        
        //1 Get the city name the user entered in the text field
        
        //2 If we have a delegate set, call the method userEnteredNewCityName
        
        //3 Dismiss the Change City View Controller to go back to the WeatherViewController
    }
    
    //This is the IBAction that gets called when the user taps the back button. It dismisses the ChangeCityViewController.
    @IBAction func backButtonPressed(_ sender: Any) {
        self.dismiss(animated: true, completion: nil)
    }
    
}
